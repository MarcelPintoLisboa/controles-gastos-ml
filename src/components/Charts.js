import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Circle, Ellipse, G, Line, Polygon, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, MESES_CURTO, palette, shade } from '../utils';
import { useStore } from '../store';

// Bloco 3D (frente + lateral + topo) para as barras isométricas
function Bloco({ x, y, w, h, d, cor, topo = true }) {
  if (h <= 0) return null;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} fill={cor} />
      {/* brilho na frente */}
      <Rect x={x} y={y} width={w * 0.35} height={h} fill="#fff" opacity={0.12} />
      <Polygon
        points={`${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y + h - d} ${x + w},${y + h}`}
        fill={shade(cor, -0.28)}
      />
      {topo && (
        <Polygon points={`${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`} fill={shade(cor, 0.3)} />
      )}
    </G>
  );
}

// Barras 3D empilhadas por mês: pago (verde) + a pagar (laranja). Toque na barra para selecionar o mês.
export function MonthlyBars({ data, selected, onSelect, height = 210 }) {
  const [w, setW] = useState(0);
  const max = Math.max(1, ...data.map((d) => d.total));
  const slot = w / 12;
  const barW = Math.max(7, slot * 0.48);
  const d = Math.min(9, slot * 0.28); // profundidade do 3D
  const padB = 24;
  const padT = d + 8;
  const chartH = height - padB - padT;
  const base = padT + chartH;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {/* piso em perspectiva */}
          <Polygon points={`0,${base} ${d},${base - d} ${w},${base - d} ${w - d},${base}`} fill={colors.soft} />
          {/* linhas de grade */}
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <Line
              key={p} x1={d} x2={w} y1={base - d - chartH * p} y2={base - d - chartH * p}
              stroke={colors.border} strokeDasharray="3 5"
            />
          ))}
          {data.map((m, i) => {
            const x = i * slot + (slot - barW - d) / 2;
            const hPago = (m.pago / max) * chartH;
            const hPagar = (m.aPagar / max) * chartH;
            const sel = selected === m.mes;
            return (
              <React.Fragment key={m.mes}>
                {sel && <Rect x={i * slot + 1} y={2} width={slot - 2} height={height - 4} fill={colors.soft} rx={10} />}
                {/* sombra no chão */}
                <Ellipse cx={x + barW / 2 + d / 2} cy={base - d / 2} rx={barW * 0.75} ry={d * 0.45} fill="#312E81" opacity={0.08} />
                {m.total === 0 ? (
                  <Bloco x={x} y={base - 3} w={barW} h={3} d={d} cor="#CBD5E1" />
                ) : (
                  <>
                    <Bloco x={x} y={base - hPago} w={barW} h={hPago} d={d} cor={colors.green} topo={hPagar <= 0} />
                    <Bloco x={x} y={base - hPago - hPagar} w={barW} h={hPagar} d={d} cor={colors.orange} />
                  </>
                )}
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
          {data.map((m) => (
            <Pressable key={m.mes} style={{ flex: 1 }} onPress={() => onSelect(m.mes)} />
          ))}
        </View>
      )}
    </View>
  );
}

export function Legend() {
  return (
    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
      <Dot color={colors.green} label="Pago" />
      <Dot color={colors.orange} label="A pagar" />
    </View>
  );
}

const Dot = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
    <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
  </View>
);

// Rosca 3D inclinada (pago / total), com espessura e sombra
export function Donut({ pago, total, size = 140 }) {
  const stroke = size * 0.15;
  const r = (size - stroke) / 2;
  const tilt = 0.58; // achatamento da perspectiva
  const depth = Math.round(size * 0.09); // espessura do anel
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, pago / total) : 0;
  const h = (size * tilt) + depth + 12;
  const cx = size / 2;
  const cy = (size * tilt) / 2 + 4;

  const anel = (dy, corResto, corPago, key) => (
    <G key={key} transform={`translate(${cx} ${cy + dy}) scale(1 ${tilt})`}>
      <Circle r={r} stroke={corResto} strokeWidth={stroke} fill="none" />
      {pct > 0 && (
        <Circle
          r={r} stroke={corPago} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90)"
        />
      )}
    </G>
  );

  const camadas = [];
  for (let k = depth; k >= 1; k--) {
    camadas.push(anel(k, shade(colors.orange, -0.3), shade(colors.green, -0.3), k));
  }

  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>
      <Svg width={size} height={h}>
        <Ellipse cx={cx} cy={cy + depth + 4} rx={r + stroke / 2} ry={(r + stroke / 2) * tilt} fill="#312E81" opacity={0.08} />
        {camadas}
        {anel(0, colors.orange, colors.green, 'topo')}
        {/* brilho no topo */}
        <G transform={`translate(${cx} ${cy}) scale(1 ${tilt})`}>
          <Circle r={r + stroke / 4} stroke="#fff" strokeWidth={stroke / 4} fill="none" opacity={0.25} />
        </G>
      </Svg>
      <View style={{ position: 'absolute', top: cy - 16, alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.15, fontWeight: '800', color: colors.text }}>{Math.round(pct * 100)}%</Text>
        <Text style={{ fontSize: 10, color: colors.muted, marginTop: -2 }}>pago</Text>
      </View>
    </View>
  );
}

// Barras horizontais em "cilindro" 3D por categoria
export function HBars({ data, limit = 8 }) {
  const { brl } = useStore();
  const list = data.slice(0, limit);
  const max = Math.max(1, ...list.map((d) => d.valor));
  return (
    <View style={{ gap: 14 }}>
      {list.map((d, i) => {
        const cor = palette[i % palette.length];
        return (
          <View key={d.nome}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: shade(cor, 0.85), alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: cor }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{d.nome}</Text>
              <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>{brl(d.valor)}</Text>
            </View>
            <Cilindro pct={d.valor / max} cor={cor} />
          </View>
        );
      })}
    </View>
  );
}

function Cilindro({ pct, cor, h = 12 }) {
  const [w, setW] = useState(0);
  const fw = Math.max(h, w * pct);
  return (
    <View style={{ height: h }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={h}>
          <Defs>
            <LinearGradient id={`cil${cor.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={shade(cor, 0.35)} />
              <Stop offset="0.45" stopColor={cor} />
              <Stop offset="1" stopColor={shade(cor, -0.35)} />
            </LinearGradient>
            <LinearGradient id="trilho" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#E2E8F0" />
              <Stop offset="1" stopColor="#F1F5F9" />
            </LinearGradient>
          </Defs>
          <Rect width={w} height={h} rx={h / 2} fill="url(#trilho)" />
          <Rect width={fw} height={h} rx={h / 2} fill={`url(#cil${cor.slice(1)})`} />
          <Rect x={h / 3} y={h * 0.18} width={Math.max(0, fw - h * 0.66)} height={h * 0.22} rx={h * 0.11} fill="#fff" opacity={0.35} />
        </Svg>
      )}
    </View>
  );
}
