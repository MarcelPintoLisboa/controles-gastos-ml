import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../utils';

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

export const Title = ({ children }) => <Text style={s.title}>{children}</Text>;

export function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipTxt, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
      {children}
    </ScrollView>
  );
}

export function Button({ label, onPress, color = colors.primary, outline }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.btn, outline ? { borderWidth: 1, borderColor: color } : { backgroundColor: color }]}
    >
      <Text style={{ color: outline ? color : '#fff', fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Stat({ label, value, color }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: color || colors.text, fontSize: 17, fontWeight: '700', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

export function YearPicker({ anos, ano, onChange }) {
  return (
    <ChipRow>
      {anos.map((a) => (
        <Chip key={a} label={String(a)} active={a === ano} onPress={() => onChange(a)} />
      ))}
    </ChipRow>
  );
}

export const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: colors.text, fontSize: 13 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
});
