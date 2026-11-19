import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import seed from './data/seed.json';
import { todayISO, brl as brlBase } from './utils';

const KEY = '@controles-gastos-ml:v1';
const KEY_OCULTAR = '@controles-gastos-ml:ocultar';
const MASCARA = 'R$ •••••';
const Ctx = createContext(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function StoreProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [ano, setAno] = useState(2027);
  const [ocultar, setOcultar] = useState(false);

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
  // formata em R$ respeitando o "ocultar valores"
  const brl = useCallback((n) => (ocultar ? MASCARA : brlBase(n)), [ocultar]);

  // carrega dados salvos (ou os dados iniciais da planilha Plan2027)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setItems(raw ? JSON.parse(raw) : seed);
      } catch (e) {
        setItems(seed);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  const add = useCallback((data) => setItems((p) => [...p, { ...data, id: newId() }]), []);
  const update = useCallback(
    (id, data) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...data } : i))),
    []
  );
  const remove = useCallback((id) => setItems((p) => p.filter((i) => i.id !== id)), []);
  const toggle = useCallback(
    (id) =>
      setItems((p) =>
        p.map((i) =>
          i.id === id
            ? i.status === 'Pago'
              ? { ...i, status: 'A pagar', dataPagamento: null }
              : { ...i, status: 'Pago', dataPagamento: todayISO() }
            : i
        )
      ),
    []
  );
  const resetSeed = useCallback(() => {
    setItems(seed);
    setAno(2027);
  }, []);

  // Copia o planejamento de um ano para outro (tudo volta como "A pagar")
  const copiarAno = useCallback((de, para) => {
    setItems((p) => {
      const base = p.filter((i) => i.ano === de).map((i) => ({
        ...i, id: newId(), ano: para, status: 'A pagar', dataPagamento: null,
      }));
      return [...p.filter((i) => i.ano !== para), ...base];
    });
  }, []);

  const anos = useMemo(() => {
    const s = new Set(items.map((i) => i.ano));
    s.add(ano);
    return [...s].sort();
  }, [items, ano]);

  const doAno = useMemo(() => items.filter((i) => i.ano === ano), [items, ano]);

  const value = {
    items, doAno, loaded, ano, setAno, anos, add, update, remove, toggle, resetSeed, copiarAno,
    ocultar, toggleOcultar, brl,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
