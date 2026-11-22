import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayISO, brl as brlBase } from './utils';
import { supabase, mensagemErro } from './supabase';
import { useAuth } from './auth';

// Os lançamentos ficam na base de dados (tabela gastos_lancamentos), separados por usuário.
// Chave antiga: dados que ficavam só no aparelho (versão sem login). São oferecidos para envio à conta.
const KEY_LOCAL = '@controles-gastos-ml:v2';
const KEY_ANTIGA = '@controles-gastos-ml:v1';
const KEY_OCULTAR = '@controles-gastos-ml:ocultar';
const MASCARA = 'R$ •••••';
const TABELA = 'gastos_lancamentos';
const Ctx = createContext(null);

// id único (texto) gerado no aparelho, para a tela atualizar na hora sem esperar o servidor
const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 8)}`;

const fromDb = (r) => ({
  id: r.id, nome: r.nome, valor: Number(r.valor), mes: r.mes, ano: r.ano, status: r.status, dataPagamento: r.data_pagamento,
});
const toDb = (i) => {
  const o = {};
  if ('id' in i) o.id = i.id;
  if ('nome' in i) o.nome = i.nome;
  if ('valor' in i) o.valor = Number(i.valor) || 0;
  if ('mes' in i) o.mes = i.mes;
  if ('ano' in i) o.ano = i.ano;
  if ('status' in i) o.status = i.status === 'Pago' ? 'Pago' : 'A pagar';
  if ('dataPagamento' in i) o.data_pagamento = i.dataPagamento || null;
  return o;
};
const chunks = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, k) => arr.slice(k * n, k * n + n));

async function carregarTudo() {
  const todos = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supabase.from(TABELA).select('*').order('ano').order('mes').range(de, de + 999);
    if (error) throw error;
    todos.push(...data);
    if (data.length < 1000) break;
  }
  return todos.map(fromDb);
}

async function inserir(lista) {
  for (const parte of chunks(lista.map(toDb), 500)) {
    const { error } = await supabase.from(TABELA).insert(parte);
    if (error) throw error;
  }
}

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [erroCarga, setErroCarga] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [ocultar, setOcultar] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // preferência "ocultar valores" (ícone de olho na tela Resumo), salva no aparelho
  useEffect(() => {
    AsyncStorage.getItem(KEY_OCULTAR).then((v) => setOcultar(v === '1')).catch(() => {});
  }, []);
  const toggleOcultar = useCallback(() => {
    setOcultar((o) => {
      AsyncStorage.setItem(KEY_OCULTAR, o ? '0' : '1').catch(() => {});
      return !o;
    });
  }, []);
  const brl = useCallback((n) => (ocultar ? MASCARA : brlBase(n)), [ocultar]);

  // Executa uma alteração: aplica na tela na hora e grava na base; se falhar, desfaz e avisa.
  // Retorna true se gravou.
  const aplicar = useCallback(async (mudarTela, gravar) => {
    const antes = itemsRef.current;
    setItems(mudarTela);
    try {
      await gravar();
      return true;
    } catch (e) {
      setItems(antes);
      Alert.alert('Não foi possível salvar', mensagemErro(e));
      return false;
    }
  }, []);

  // Oferece enviar para a conta os dados que estavam salvos só neste aparelho
  const oferecerDadosLocais = useCallback(async () => {
    let locais = [];
    try {
      AsyncStorage.removeItem(KEY_ANTIGA).catch(() => {});
      const raw = await AsyncStorage.getItem(KEY_LOCAL);
      locais = raw ? JSON.parse(raw) : [];
    } catch {
      locais = [];
    }
    if (!Array.isArray(locais) || !locais.length) return;
    Alert.alert(
      'Dados neste aparelho',
      `Encontramos ${locais.length} lançamentos salvos só neste aparelho. Deseja enviá-los para a sua conta?`,
      [
        { text: 'Depois', style: 'cancel' },
        {
          text: 'Apagar do aparelho', style: 'destructive',
          onPress: () => AsyncStorage.removeItem(KEY_LOCAL).catch(() => {}),
        },
        {
          text: 'Enviar',
          onPress: async () => {
            const novos = locais
              .filter((i) => i && i.nome && i.mes >= 1 && i.mes <= 12 && i.ano)
              .map((i) => ({ ...i, id: newId(), valor: Number(i.valor) || 0 }));
            try {
              await inserir(novos);
              await AsyncStorage.removeItem(KEY_LOCAL);
              setItems((p) => [...p, ...novos]);
              Alert.alert('Pronto', `${novos.length} lançamentos enviados para a sua conta.`);
            } catch (e) {
              Alert.alert('Não foi possível enviar', mensagemErro(e));
            }
          },
        },
      ]
    );
  }, []);

  const recarregar = useCallback(async () => {
    setErroCarga('');
    try {
      const lista = await carregarTudo();
      setItems(lista);
      setLoaded(true);
      return lista;
    } catch (e) {
      setErroCarga(mensagemErro(e));
      setLoaded(true);
      return null;
    }
  }, []);

  // carrega os dados do usuário logado
  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    setItems([]);
    recarregar().then((lista) => {
      if (lista) {
        const anos = [...new Set(lista.map((i) => i.ano))].sort();
        const atual = new Date().getFullYear();
        if (anos.length && !anos.includes(atual)) setAno(anos[anos.length - 1]);
        oferecerDadosLocais();
      }
    });
  }, [user?.id, recarregar, oferecerDadosLocais]);

  const add = useCallback((data) => {
    const novo = { ...data, id: newId() };
    return aplicar((p) => [...p, novo], () => inserir([novo]));
  }, [aplicar]);

  const update = useCallback((id, data) =>
    aplicar(
      (p) => p.map((i) => (i.id === id ? { ...i, ...data } : i)),
      async () => {
        const campos = toDb(data);
        delete campos.id;
        const { error } = await supabase.from(TABELA).update(campos).eq('id', id);
        if (error) throw error;
      }
    ), [aplicar]);

  const remove = useCallback((id) =>
    aplicar(
      (p) => p.filter((i) => i.id !== id),
      async () => {
        const { error } = await supabase.from(TABELA).delete().eq('id', id);
        if (error) throw error;
      }
    ), [aplicar]);

  const toggle = useCallback((id) => {
    const i = itemsRef.current.find((x) => x.id === id);
    if (!i) return;
    const mudanca = i.status === 'Pago'
      ? { status: 'A pagar', dataPagamento: null }
      : { status: 'Pago', dataPagamento: todayISO() };
    return update(id, mudanca);
  }, [update]);

  // Apaga todos os lançamentos de um ano
  const zerarAno = useCallback((a) =>
    aplicar(
      (p) => p.filter((i) => i.ano !== a),
      async () => {
        const { error } = await supabase.from(TABELA).delete().eq('ano', a);
        if (error) throw error;
      }
    ), [aplicar]);

  // Importa lançamentos de planilha: modo "substituir" apaga o ano antes; "adicionar" soma aos existentes
  const importar = useCallback((a, lista, modo) => {
    const novos = lista.map((i) => ({ ...i, ano: a, id: newId() }));
    return aplicar(
      (p) => [...(modo === 'substituir' ? p.filter((i) => i.ano !== a) : p), ...novos],
      async () => {
        if (modo === 'substituir') {
          const { error } = await supabase.from(TABELA).delete().eq('ano', a);
          if (error) throw error;
        }
        await inserir(novos);
      }
    );
  }, [aplicar]);

  // Copia o planejamento de um ano para outro (tudo volta como "A pagar") — feito no banco
  const copiarAno = useCallback(async (de, para) => {
    try {
      const { error } = await supabase.rpc('gastos_copiar_ano', { p_de: de, p_para: para });
      if (error) throw error;
      await recarregar();
    } catch (e) {
      Alert.alert('Não foi possível criar o ano', mensagemErro(e));
    }
  }, [recarregar]);

  const anos = useMemo(() => {
    const s = new Set(items.map((i) => i.ano));
    s.add(ano);
    return [...s].sort();
  }, [items, ano]);

  const doAno = useMemo(() => items.filter((i) => i.ano === ano), [items, ano]);

  const value = {
    items, doAno, loaded, erroCarga, recarregar, ano, setAno, anos, add, update, remove, toggle, zerarAno, importar, copiarAno,
    ocultar, toggleOcultar, brl,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
