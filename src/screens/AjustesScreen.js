import React, { useState } from 'react';
import { ScrollView, Text, Alert, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Card, Title, Button, YearPicker } from '../components/ui';
import { colors, MESES, brl } from '../utils';

export default function AjustesScreen() {
  const { items, doAno, ano, setAno, anos, copiarAno, resetSeed } = useStore();
  const [novoAno, setNovoAno] = useState(ano + 1);

  const criarAno = () =>
    Alert.alert(
      `Criar planejamento ${novoAno}`,
      `Copia todos os lançamentos de ${ano} para ${novoAno} (tudo como "A pagar"). Se ${novoAno} já existir, será substituído.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Criar', onPress: () => { copiarAno(ano, novoAno); setAno(novoAno); } },
      ]
    );

  const restaurar = () =>
    Alert.alert('Restaurar dados', 'Apaga todas as alterações e volta aos dados da planilha Plan2027.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', style: 'destructive', onPress: resetSeed },
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
            <Button label="Restaurar dados da planilha Plan2027" color={colors.danger} outline onPress={restaurar} />
          </View>
          <Text style={{ color: colors.muted, marginTop: 10, fontSize: 12 }}>
            Total salvo no aparelho: {items.length} lançamentos ({brl(items.reduce((a, i) => a + i.valor, 0))}).
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
