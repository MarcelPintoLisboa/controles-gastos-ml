import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Card, Title, Stat, YearPicker } from '../components/ui';
import { MonthlyBars, Legend, Donut, HBars } from '../components/Charts';
import { colors, brl, sum, resumoPorMes, porCategoria, MESES } from '../utils';

export default function ResumoScreen({ navigation }) {
  const { doAno, ano, setAno, anos, loaded } = useStore();
  const meses = useMemo(() => resumoPorMes(doAno), [doAno]);
  const total = sum(doAno);
  const pago = sum(doAno.filter((i) => i.status === 'Pago'));
  const falta = total - pago;
  const cats = useMemo(() => porCategoria(doAno), [doAno]);
  const proximo = meses.find((m) => m.aPagar > 0);

  if (!loaded) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, margin: 16, marginBottom: 10 }}>
          Controles de gastos ML
        </Text>
        <YearPicker anos={anos} ano={ano} onChange={setAno} />
        <View style={{ height: 12 }} />

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Donut pago={pago} total={total} />
            <View style={{ flex: 1, gap: 12 }}>
              <Stat label={`Planejado ${ano}`} value={brl(total)} />
              <Stat label="Já pago" value={brl(pago)} color={colors.green} />
              <Stat label="Falta pagar" value={brl(falta)} color={colors.orange} />
            </View>
          </View>
        </Card>

        <Card>
          <Title>Por mês</Title>
          <MonthlyBars
            data={meses}
            onSelect={(m) => navigation.navigate('Faltam', { mes: m })}
          />
          <Legend />
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>Toque em um mês para ver o que falta pagar.</Text>
        </Card>

        {proximo && (
          <Card>
            <Title>Próximo mês com pendências</Title>
            <Text style={{ color: colors.text, fontSize: 15 }}>
              {MESES[proximo.mes - 1]}: faltam <Text style={{ fontWeight: '700', color: colors.orange }}>{brl(proximo.aPagar)}</Text>
            </Text>
          </Card>
        )}

        <Card>
          <Title>Maiores gastos do ano</Title>
          <HBars data={cats} />
        </Card>

        <Card>
          <Title>Mês a mês</Title>
          {meses.map((m) => (
            <View key={m.mes} style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ flex: 1, color: colors.text }}>{MESES[m.mes - 1]}</Text>
              <Text style={{ width: 95, textAlign: 'right', color: colors.green }}>{brl(m.pago)}</Text>
              <Text style={{ width: 95, textAlign: 'right', color: colors.orange }}>{brl(m.aPagar)}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <Text style={{ flex: 1 }} />
            <Text style={{ width: 95, textAlign: 'right', color: colors.muted, fontSize: 11 }}>Pago</Text>
            <Text style={{ width: 95, textAlign: 'right', color: colors.muted, fontSize: 11 }}>A pagar</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
