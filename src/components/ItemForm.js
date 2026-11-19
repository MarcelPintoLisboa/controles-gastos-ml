import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { colors, MESES_CURTO, parseValor, parseData, fmtData, todayISO } from '../utils';
import { Button, Chip } from './ui';

// Modal para adicionar/editar um pagamento. `item` null = novo.
export default function ItemForm({ visible, item, ano, mesInicial, onClose, onSave, onDelete }) {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [mes, setMes] = useState(1);
  const [pago, setPago] = useState(false);
  const [data, setData] = useState('');
  const [repetir, setRepetir] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setNome(item?.nome ?? '');
    setValor(item ? String(item.valor).replace('.', ',') : '');
    setMes(item?.mes ?? mesInicial ?? 1);
    setPago(item?.status === 'Pago');
    setData(item?.dataPagamento ? fmtData(item.dataPagamento) : '');
    setRepetir(false);
  }, [visible, item, mesInicial]);

  const salvar = () => {
    const v = parseValor(valor);
    if (!nome.trim()) return Alert.alert('Informe o nome do pagamento');
    if (!(v >= 0)) return Alert.alert('Valor inválido', 'Use por exemplo 1234,56');
    let dataPag = null;
    if (pago) dataPag = parseData(data) || todayISO();
    onSave(
      { nome: nome.trim(), valor: v, mes, ano, status: pago ? 'Pago' : 'A pagar', dataPagamento: dataPag },
      { repetirAteDezembro: repetir && !item }
    );
  };

  const confirmarExcluir = () =>
    Alert.alert('Excluir', `Excluir "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete(item.id) },
    ]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' }}>
          <Pressable onPress={onClose}><Text style={{ color: colors.primary, fontSize: 16 }}>Cancelar</Text></Pressable>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>{item ? 'Editar pagamento' : 'Novo pagamento'}</Text>
          <Pressable onPress={salvar}><Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Salvar</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }} keyboardShouldPersistTaps="handled">
          <Label>Nome</Label>
          <Input value={nome} onChangeText={setNome} placeholder="Ex.: Energia" />
          <Label>Valor (R$)</Label>
          <Input value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" />
          <Label>Mês ({ano})</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MESES_CURTO.map((m, i) => (
              <Chip key={m} label={m} active={mes === i + 1} onPress={() => setMes(i + 1)} />
            ))}
          </View>
          <Label>Situação</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="A pagar" active={!pago} onPress={() => setPago(false)} />
            <Chip label="Pago" active={pago} onPress={() => setPago(true)} />
          </View>
          {pago && (
            <>
              <Label>Data do pagamento (dd/mm/aaaa)</Label>
              <Input value={data} onChangeText={setData} placeholder="Hoje, se vazio" keyboardType="numbers-and-punctuation" />
            </>
          )}
          {!item && (
            <Pressable onPress={() => setRepetir(!repetir)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <View style={{
                width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: colors.primary,
                backgroundColor: repetir ? colors.primary : '#fff', alignItems: 'center', justifyContent: 'center',
              }}>
                {repetir && <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>}
              </View>
              <Text style={{ color: colors.text }}>Repetir todo mês até dezembro</Text>
            </Pressable>
          )}
          {item && (
            <View style={{ marginTop: 24 }}>
              <Button label="Excluir pagamento" color={colors.danger} outline onPress={confirmarExcluir} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const Label = ({ children }) => (
  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>{children}</Text>
);
const Input = (props) => (
  <TextInput
    {...props}
    placeholderTextColor="#A0A8B5"
    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16, color: colors.text }}
  />
);
