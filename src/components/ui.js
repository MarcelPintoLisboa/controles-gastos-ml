import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { colors } from '../utils';

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

export const Title = ({ children, right }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
    <Text style={[s.title, { flex: 1, marginBottom: 0 }]}>{children}</Text>
    {right}
  </View>
);

// Fundo em degradê (SVG, sem dependência nativa extra)
export function Gradient({ from = colors.primary, to = colors.primary2, radius = 0 }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" rx={radius} fill="url(#grad)" />
      {/* bolhas decorativas */}
      <Circle cx="92%" cy="8%" r="70" fill="#fff" opacity={0.08} />
      <Circle cx="78%" cy="105%" r="55" fill="#fff" opacity={0.06} />
    </Svg>
  );
}

// Cartão de destaque com degradê.
// A sombra fica numa View externa: no iOS, overflow 'hidden' na mesma View apaga a sombra.
export const HeroCard = ({ children, style }) => (
  <View style={[s.hero, style]}>
    <View style={s.heroInner}>
      <Gradient radius={24} />
      {children}
    </View>
  </View>
);

export function IconButton({ children, onPress, label }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label} style={s.iconBtn}>
      {children}
    </Pressable>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipTxt, active && { color: '#fff', fontWeight: '700' }]}>{label}</Text>
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
      style={({ pressed }) => [
        s.btn,
        outline ? { borderWidth: 1.5, borderColor: color } : { backgroundColor: color, ...s.btnShadow, shadowColor: color },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={{ color: outline ? color : '#fff', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export function Stat({ label, value, color, dot }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {dot && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />}
        <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      </View>
      <Text style={{ color: color || colors.text, fontSize: 17, fontWeight: '800', marginTop: 2 }}>{value}</Text>
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
    backgroundColor: colors.card, borderRadius: 20, padding: 18, marginHorizontal: 16, marginBottom: 14,
    shadowColor: '#312E81', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  hero: {
    borderRadius: 24, marginHorizontal: 16, marginBottom: 14,
    shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8,
    backgroundColor: colors.primary,
  },
  heroInner: { borderRadius: 24, padding: 20, overflow: 'hidden' },
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: colors.text, fontSize: 13 },
  btn: { paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center' },
  btnShadow: { shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
  },
});
