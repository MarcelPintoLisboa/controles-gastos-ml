export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
export const MESES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const colors = {
  primary: '#4F46E5',
  primary2: '#7C3AED', // fim do degradê
  orange: '#F59E0B',
  green: '#10B981',
  bg: '#F3F5FB',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  soft: '#EEF0FF', // fundo suave de destaque
};

// Paleta para séries/categorias
export const palette = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

// Clareia (amt > 0) ou escurece (amt < 0) uma cor hex. amt entre -1 e 1.
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Formata em R$ no padrão brasileiro sem depender de Intl (Hermes/Android)
export function brl(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const neg = v < 0;
  const [int, dec] = Math.abs(v).toFixed(2).split('.');
  const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}R$ ${withDots},${dec}`;
}

export function parseValor(text) {
  let s = String(text || '').trim().replace(/[^\d.,-]/g, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function todayISO() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtData(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// dd/mm/aaaa -> aaaa-mm-dd (ou null)
export function parseData(text) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text || '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

export const sum = (arr) => arr.reduce((a, i) => a + i.valor, 0);

export function resumoPorMes(items) {
  return MESES.map((_, idx) => {
    const mes = idx + 1;
    const doMes = items.filter((i) => i.mes === mes);
    const pago = sum(doMes.filter((i) => i.status === 'Pago'));
    const aPagar = sum(doMes.filter((i) => i.status !== 'Pago'));
    return { mes, pago, aPagar, total: pago + aPagar, qtd: doMes.length };
  });
}

export function porCategoria(items) {
  const map = {};
  items.forEach((i) => {
    map[i.nome] = (map[i.nome] || 0) + i.valor;
  });
  return Object.entries(map)
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => b.valor - a.valor);
}
