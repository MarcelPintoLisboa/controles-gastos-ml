import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Card, Title, Stat, Chip, ChipRow } from '../components/ui';
import { Donut } from '../components/Charts';
import ItemRow from '../components/ItemRow';
import ItemForm from '../components/ItemForm';
import { useEditor } from '../useEditor';
import { colors, sum, MESES, MESES_CURTO } from '../utils';

export default function FaltamScreen({ route }) {
  const { doAno, ano, toggle, brl } = useStore();
  const hoje = new Date();
  const mesInicial = hoje.getFullYear() === ano ? hoje.getMonth() + 1 : 1;
  const [mes, setMes] = useState(mesInicial);
  const { editar, formProps } = useEditor();

  useEffect(() => {
    if (route?.params?.mes) setMes(route.params.mes);
  }, [route?.params?.mes]);

  const doMes = useMemo(() => doAno.filter((i) => i.mes === mes), [doAno, mes]);
  const pendentes = doMes.filter((i) => i.status !== 'Pago').sort((a, b) => b.valor - a.valor);
  const pagos = doMes.filter((i) => i.status === 'Pago');
  const totalMes = sum(doMes);
  const pagoMes = sum(pagos);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, margin: 16, marginBottom: 10 }}>
        O que falta pagar
      </Text>
      <View style={{ height: 44 }}>
        <ChipRow>
          {MESES_CURTO.map((m, i) => (
            <Chip key={m} label={m} active={mes === i + 1} onPress={() => setMes(i + 1)} />
          ))}
        </ChipRow>
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        <Card>
          <Text style={{ color: colors.muted, marginBottom: 8 }}>{MESES[mes - 1]} de {ano}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Donut pago={pagoMes} total={totalMes} size={100} />
            <View style={{ flex: 1, gap: 10 }}>
              <Stat label="Falta pagar" value={brl(totalMes - pagoMes)} color={colors.orange} />
              <Stat label="Já pago" value={brl(pagoMes)} color={colors.green} />
              <Stat label="Total do mês" value={brl(totalMes)} />
            </View>
          </View>
        </Card>

        <Card>
          <Title>Pendentes ({pendentes.length})</Title>
          {pendentes.length === 0 && (
            <Text style={{ color: colors.green }}>{doMes.length ? 'Tudo pago neste mês 🎉' : 'Nenhum lançamento neste mês.'}</Text>
          )}
          {pendentes.map((i) => (
            <ItemRow key={i.id} item={i} onToggle={toggle} onEdit={editar} />
          ))}
        </Card>

        {pagos.length > 0 && (
          <Card>
            <Title>Já pagos ({pagos.length})</Title>
            {pagos.map((i) => (
              <ItemRow key={i.id} item={i} onToggle={toggle} onEdit={editar} />
            ))}
          </Card>
        )}
      </ScrollView>
      <ItemForm {...formProps} ano={ano} />
    </SafeAreaView>
  );
}
