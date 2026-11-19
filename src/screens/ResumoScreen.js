import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { Card, Title, Stat, YearPicker, HeroCard, IconButton, Button } from '../components/ui';
import { MonthlyBars, Legend, Donut, HBars } from '../components/Charts';
import { colors, sum, resumoPorMes, porCategoria, MESES } from '../utils';

export default function ResumoScreen({ navigation }) {
  const { doAno, ano, setAno, anos, loaded, brl, ocultar, toggleOcultar } = useStore();
  const meses = useMemo(() => resumoPorMes(doAno), [doAno]);
  const total = sum(doAno);
  const pago = sum(doAno.filter((i) => i.status === 'Pago'));
  const falta = total - pago;
  const pct = total > 0 ? pago / total : 0;
  const cats = useMemo(() => porCategoria(doAno), [doAno]);
  const proximo = meses.find((m) => m.aPagar > 0);
  const qtdPagos = doAno.filter((i) => i.status === 'Pago').length;

  if (!loaded) return null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Seu planejamento</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>Controles de gastos</Text>
          </View>
          <IconButton onPress={toggleOcultar} label={ocultar ? 'Mostrar valores' : 'Ocultar valores'}>
            <Ionicons name={ocultar ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primary} />
          </IconButton>
        </View>

        <YearPicker anos={anos} ano={ano} onChange={setAno} />
        <View style={{ height: 14 }} />

        <HeroCard>
          <Text style={{ color: '#E0E7FF', fontSize: 13, fontWeight: '600' }}>Planejado para {ano}</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 }}>{brl(total)}</Text>

          <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 16, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${pct * 100}%`, borderRadius: 4, backgroundColor: '#fff' }} />
          </View>
          <Text style={{ color: '#E0E7FF', fontSize: 12, marginTop: 6 }}>{Math.round(pct * 100)}% do ano já pago</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <HeroPill icon="checkmark-circle" label="Já pago" value={brl(pago)} />
            <HeroPill icon="time" label="Falta pagar" value={brl(falta)} />
          </View>
        </HeroCard>

        {doAno.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name="document-text-outline" size={30} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Nenhum lançamento em {ano}</Text>
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 16 }}>
              Importe sua planilha de obrigações para ver os gráficos.
            </Text>
            <Button label="Importar planilha" onPress={() => navigation.navigate('Ajustes')} />
          </Card>
        ) : (
          <>
            <Card>
              <Title>Progresso do ano</Title>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Donut pago={pago} total={total} />
                <View style={{ flex: 1, gap: 14 }}>
                  <Stat label="Pago" value={brl(pago)} color={colors.green} dot={colors.green} />
                  <Stat label="A pagar" value={brl(falta)} color={colors.orange} dot={colors.orange} />
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {qtdPagos} de {doAno.length} obrigações quitadas
                  </Text>
                </View>
              </View>
            </Card>

            <Card>
              <Title right={<Legend />}>Por mês</Title>
              <MonthlyBars data={meses} onSelect={(m) => navigation.navigate('Faltam', { mes: m })} />
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>Toque em um mês para ver o que falta pagar.</Text>
            </Card>

            {proximo && (
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="alarm-outline" size={24} color={colors.orange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Próximo mês com pendências</Text>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 2 }}>
                    {MESES[proximo.mes - 1]} · <Text style={{ color: colors.orange }}>{brl(proximo.aPagar)}</Text>
                  </Text>
                </View>
              </Card>
            )}

            <Card>
              <Title>Maiores gastos do ano</Title>
              <HBars data={cats} />
            </Card>

            <Card>
              <Title>Mês a mês</Title>
              <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
                <Text style={{ flex: 1 }} />
                <Text style={{ width: 95, textAlign: 'right', color: colors.muted, fontSize: 11, fontWeight: '700' }}>PAGO</Text>
                <Text style={{ width: 95, textAlign: 'right', color: colors.muted, fontSize: 11, fontWeight: '700' }}>A PAGAR</Text>
              </View>
              {meses.map((m, i) => (
                <View
                  key={m.mes}
                  style={{ flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 10, backgroundColor: i % 2 ? 'transparent' : '#F8FAFC' }}
                >
                  <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>{MESES[m.mes - 1]}</Text>
                  <Text style={{ width: 95, textAlign: 'right', color: colors.green, fontWeight: '600' }}>{brl(m.pago)}</Text>
                  <Text style={{ width: 95, textAlign: 'right', color: colors.orange, fontWeight: '600' }}>{brl(m.aPagar)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroPill({ icon, label, value }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 16, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={icon} size={14} color="#E0E7FF" />
        <Text style={{ color: '#E0E7FF', fontSize: 12 }}>{label}</Text>
      </View>
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 4 }} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}
