import React, { useState } from 'react';
import { ScrollView, Text, Alert, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { useAuth } from '../auth';
import { Card, Title, Button, YearPicker, Chip, ChipRow } from '../components/ui';
import { colors, MESES } from '../utils';
import { escolherPlanilha, lerAba } from '../importPlanilha';

export default function AjustesScreen() {
  const { items, doAno, ano, setAno, anos, copiarAno, zerarAno, importar, brl } = useStore();
  const { user, sair } = useAuth();
  const confirmarSair = () =>
    Alert.alert('Sair da conta', 'Seus dados continuam salvos na nuvem. Para ver de novo, é só entrar.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);
  const [novoAno, setNovoAno] = useState(ano + 1);

  // importação: arquivo escolhido, aba selecionada e prévia da leitura
  const [planilha, setPlanilha] = useState(null);
  const [aba, setAba] = useState(null);
  const [previa, setPrevia] = useState(null);
  const [erroImport, setErroImport] = useState('');
  const [carregando, setCarregando] = useState(false);

  const limparImport = () => { setPlanilha(null); setAba(null); setPrevia(null); setErroImport(''); };

  const selecionarAba = (wb, nome) => {
    setAba(nome);
    try {
      setPrevia(lerAba(wb, nome, ano));
      setErroImport('');
    } catch (e) {
      setPrevia(null);
      setErroImport(e.message);
    }
  };

  const escolherArquivo = async () => {
    setCarregando(true);
    try {
      const p = await escolherPlanilha();
      if (!p) return;
      setPlanilha(p);
      setPrevia(null);
      setErroImport('');
      setAba(null);
      if (p.abas.length === 1) selecionarAba(p.wb, p.abas[0]);
    } catch (e) {
      limparImport();
      setErroImport('Não foi possível ler o arquivo. Use uma planilha .xlsx, .xls ou .csv.');
    } finally {
      setCarregando(false);
    }
  };

  const confirmarImport = (modo) => {
    const msg =
      modo === 'substituir'
        ? `Os ${doAno.length} lançamentos atuais de ${ano} serão apagados e substituídos por ${previa.itens.length} da aba "${aba}".`
        : `${previa.itens.length} lançamentos da aba "${aba}" serão adicionados a ${ano}.`;
    Alert.alert('Importar planilha', msg, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Importar',
        style: modo === 'substituir' ? 'destructive' : 'default',
        onPress: async () => {
          const qtd = previa.itens.length;
          limparImport();
          if (await importar(ano, previa.itens, modo)) Alert.alert('Pronto', `${qtd} lançamentos importados em ${ano}.`);
        },
      },
    ]);
  };

  const criarAno = () =>
    Alert.alert(
      `Criar planejamento ${novoAno}`,
      `Copia todos os lançamentos de ${ano} para ${novoAno} (tudo como "A pagar"). Se ${novoAno} já existir, será substituído.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Criar', onPress: () => { copiarAno(ano, novoAno); setAno(novoAno); } },
      ]
    );

  const zerar = () =>
    Alert.alert(`Zerar ${ano}`, `Apaga todos os ${doAno.length} lançamentos de ${ano}. Não dá para desfazer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Zerar', style: 'destructive', onPress: () => zerarAno(ano) },
    ]);

  const exportar = () => {
    const linhas = ['Nome;Valor;Mês;Ano;Status;Data pagamento'].concat(
      doAno.map((i) => `${i.nome};${String(i.valor).replace('.', ',')};${MESES[i.mes - 1]};${i.ano};${i.status};${i.dataPagamento || ''}`)
    );
    Share.share({ message: linhas.join('\n'), title: `Controles de gastos ML - ${ano}` });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, margin: 16 }}>Ajustes</Text>

        <Card>
          <Title>Ano em uso</Title>
          <View style={{ marginHorizontal: -16 }}><YearPicker anos={anos} ano={ano} onChange={setAno} /></View>
          <Text style={{ color: colors.muted, marginTop: 10 }}>{doAno.length} lançamentos em {ano}.</Text>
        </Card>

        <Card>
          <Title>Importar planilha</Title>
          <Text style={{ color: colors.muted, marginBottom: 10 }}>
            A aba precisa ter as colunas <Text style={{ fontWeight: '700' }}>Obrigações</Text>,{' '}
            <Text style={{ fontWeight: '700' }}>Valor</Text>, <Text style={{ fontWeight: '700' }}>Mês</Text> e{' '}
            <Text style={{ fontWeight: '700' }}>Status</Text> (Pago ou A pagar). Os dados entram em {ano}.
          </Text>
          <Button
            label={carregando ? 'Lendo arquivo…' : planilha ? 'Escolher outro arquivo' : 'Escolher planilha'}
            outline={!!planilha}
            onPress={carregando ? undefined : escolherArquivo}
          />

          {planilha && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: colors.text, marginBottom: 8 }}>
                Arquivo: <Text style={{ fontWeight: '700' }}>{planilha.nomeArquivo}</Text>
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>Escolha a aba:</Text>
              <View style={{ marginHorizontal: -16 }}>
                <ChipRow>
                  {planilha.abas.map((n) => (
                    <Chip key={n} label={n} active={n === aba} onPress={() => selecionarAba(planilha.wb, n)} />
                  ))}
                </ChipRow>
              </View>
            </View>
          )}

          {!!erroImport && <Text style={{ color: colors.danger, marginTop: 10 }}>{erroImport}</Text>}

          {previa && (
            <View style={{ marginTop: 12, gap: 10 }}>
              <Text style={{ color: colors.text }}>
                {previa.itens.length} obrigações encontradas
                {previa.itens.length > 0 && ` · total ${brl(previa.itens.reduce((a, i) => a + i.valor, 0))}`}
              </Text>
              {previa.erros.length > 0 && (
                <Text style={{ color: colors.orange, fontSize: 12 }}>
                  {previa.erros.length} linha(s) ignorada(s) por falta de nome, valor ou mês válido: {previa.erros.slice(0, 10).join(', ')}
                  {previa.erros.length > 10 ? '…' : ''}
                </Text>
              )}
              {previa.itens.length > 0 && (
                <>
                  <Button label={`Substituir dados de ${ano}`} onPress={() => confirmarImport('substituir')} />
                  <Button label={`Adicionar aos dados de ${ano}`} outline onPress={() => confirmarImport('adicionar')} />
                </>
              )}
              <Button label="Cancelar" outline color={colors.muted} onPress={limparImport} />
            </View>
          )}
        </Card>

        <Card>
          <Title>Novo planejamento anual</Title>
          <Text style={{ color: colors.muted, marginBottom: 10 }}>
            Cria {novoAno} copiando os valores de {ano}. Depois é só ajustar o que mudar.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <Button label="−" outline onPress={() => setNovoAno((a) => a - 1)} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>{novoAno}</Text>
            </View>
            <Button label="+" outline onPress={() => setNovoAno((a) => a + 1)} />
          </View>
          <Button label={`Criar ${novoAno} a partir de ${ano}`} onPress={criarAno} />
        </Card>

        <Card>
          <Title>Dados</Title>
          <View style={{ gap: 10 }}>
            <Button label="Exportar (compartilhar CSV)" outline onPress={exportar} />
            <Button label={`Zerar dados de ${ano}`} color={colors.danger} outline onPress={zerar} />
          </View>
          <Text style={{ color: colors.muted, marginTop: 10, fontSize: 12 }}>
            Total salvo na sua conta: {items.length} lançamentos ({brl(items.reduce((a, i) => a + i.valor, 0))}).
          </Text>
        </Card>

        <Card>
          <Title>Conta</Title>
          <Text style={{ color: colors.muted, marginBottom: 4 }}>Conectado como</Text>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>{user?.email}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>
            Seus lançamentos ficam salvos na nuvem. Entre com a mesma conta em outro aparelho para ver os mesmos dados.
          </Text>
          <Button label="Sair da conta" outline color={colors.danger} onPress={confirmarSair} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
