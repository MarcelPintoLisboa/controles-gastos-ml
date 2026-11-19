import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, brl, fmtData, MESES_CURTO } from '../utils';

// Toque no círculo = marcar pago/a pagar. Toque no resto = editar.
export default function ItemRow({ item, onToggle, onEdit, showMes }) {
  const pago = item.status === 'Pago';
  return (
    <Pressable
      onPress={() => onEdit(item)}
      style={{
        flexDirection: 'row', alignItems: 'center', paddingVertical: 11,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}
    >
      <Pressable onPress={() => onToggle(item.id)} hitSlop={10} style={{ marginRight: 12 }}>
        <Ionicons
          name={pago ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={pago ? colors.green : colors.orange}
        />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, textDecorationLine: pago ? 'line-through' : 'none' }}>
          {item.nome}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {showMes ? `${MESES_CURTO[item.mes - 1]}/${item.ano} · ` : ''}
          {pago ? `Pago${item.dataPagamento ? ' em ' + fmtData(item.dataPagamento) : ''}` : 'A pagar'}
        </Text>
      </View>
      <Text style={{ color: pago ? colors.green : colors.text, fontWeight: '600', fontSize: 15 }}>{brl(item.valor)}</Text>
    </Pressable>
  );
}
