import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText } from 'react-native-svg';
import { colors, MESES_CURTO, brl } from '../utils';

// Barras empilhadas por mês: pago (verde) + a pagar (laranja). Toque na barra para selecionar o mês.
export function MonthlyBars({ data, selected, onSelect, height = 190 }) {
  const [w, setW] = useState(0);
  const max = Math.max(1, ...data.map((d) => d.total));
  const padB = 22;
  const chartH = height - padB;
  const slot = w / 12;
  const barW = Math.max(8, slot * 0.6);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {data.map((d, i) => {
            const x = i * slot + (slot - barW) / 2;
            const hPago = (d.pago / max) * (chartH - 6);
            const hPagar = (d.aPagar / max) * (chartH - 6);
            const sel = selected === d.mes;
            return (
              <React.Fragment key={d.mes}>
                {sel && <Rect x={i * slot} y={0} width={slot} height={height} fill="#EAF1FB" rx={6} />}
                <Rect x={x} y={chartH - hPago} width={barW} height={hPago} fill={colors.green} rx={2} />
                <Rect x={x} y={chartH - hPago - hPagar} width={barW} height={hPagar} fill={colors.orange} rx={2} />
                <SvgText
                  x={i * slot + slot / 2}
                  y={height - 6}
                  fontSize={10}
                  textAnchor="middle"
                  fill={sel ? colors.primary : colors.muted}
                  fontWeight={sel ? 'bold' : 'normal'}
                >
                  {MESES_CURTO[i]}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      )}
      {w > 0 && onSelect && (
        <View style={{ position: 'absolute', flexDirection: 'row', width: w, height }}>
          {data.map((d) => (
            <Pressable key={d.mes} style={{ flex: 1 }} onPress={() => onSelect(d.mes)} />
          ))}
        </View>
      )}
    </View>
  );
}

export function Legend() {
  return (
    <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
      <Dot color={colors.green} label="Pago" />
      <Dot color={colors.orange} label="A pagar" />
    </View>
  );
}

const Dot = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
    <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
  </View>
);

// Rosca de progresso (pago / total)
export function Donut({ pago, total, size = 120 }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, pago / total) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.orange} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={colors.green} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * pct} ${c}`} strokeLinecap="butt"
          rotation={-90} origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{Math.round(pct * 100)}%</Text>
      <Text style={{ fontSize: 11, color: colors.muted }}>pago</Text>
    </View>
  );
}

// Barras horizontais por categoria
export function HBars({ data, color = colors.primary, limit = 8 }) {
  const list = data.slice(0, limit);
  const max = Math.max(1, ...list.map((d) => d.valor));
  return (
    <View style={{ gap: 10 }}>
      {list.map((d) => (
        <View key={d.nome}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontSize: 13 }}>{d.nome}</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{brl(d.valor)}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, marginTop: 4 }}>
            <View style={{ height: 8, width: `${(d.valor / max) * 100}%`, backgroundColor: color, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}
