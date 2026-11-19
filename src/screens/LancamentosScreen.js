import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { Chip, ChipRow } from '../components/ui';
import ItemRow from '../components/ItemRow';
import ItemForm from '../components/ItemForm';
import { useEditor } from '../useEditor';
import { colors, brl, sum, MESES_CURTO } from '../utils';

export default function LancamentosScreen() {
  const { doAno, ano, toggle } = useStore();
  const [mes, setMes] = useState(0); // 0 = todos
  const [status, setStatus] = useState('Todos');
  const [busca, setBusca] = useState('');
  const { novo, editar, formProps } = useEditor();

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return doAno
      .filter((i) => (mes ? i.mes === mes : true))
      .filter((i) => (status === 'Todos' ? true : status === 'Pago' ? i.status === 'Pago' : i.status !== 'Pago'))
      .filter((i) => (q ? i.nome.toLowerCase().includes(q) : true))
      .sort((a, b) => a.mes - b.mes || a.nome.localeCompare(b.nome));
  }, [doAno, mes, status, busca]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Lançamentos {ano}</Text>
        <Pressable
          onPress={() => novo(mes || 1)}
          style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', gap: 4, alignItems: 'center' }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Novo</Text>
        </Pressable>
      </View>

      <TextInput
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar (ex.: energia)"
        placeholderTextColor="#A0A8B5"
        style={{ backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }}
      />
      <View style={{ height: 40, marginBottom: 6 }}>
        <ChipRow>
          {['Todos', 'A pagar', 'Pago'].map((s) => (
            <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </ChipRow>
      </View>
      <View style={{ height: 40 }}>
        <ChipRow>
          <Chip label="Ano todo" active={mes === 0} onPress={() => setMes(0)} />
          {MESES_CURTO.map((m, i) => (
            <Chip key={m} label={m} active={mes === i + 1} onPress={() => setMes(i + 1)} />
          ))}
        </ChipRow>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: colors.muted }}>{lista.length} itens</Text>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{brl(sum(lista))}</Text>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 14, marginBottom: 24 }}
        renderItem={({ item }) => <ItemRow item={item} onToggle={toggle} onEdit={editar} showMes={!mes} />}
        ListEmptyComponent={<Text style={{ color: colors.muted, padding: 20, textAlign: 'center' }}>Nada encontrado.</Text>}
      />
      <ItemForm {...formProps} ano={ano} />
    </SafeAreaView>
  );
}
