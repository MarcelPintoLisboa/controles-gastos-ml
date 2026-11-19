export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
export const MESES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const colors = {
  primary: '#1E5FA8',
  orange: '#F28C28',
  green: '#2E9E6B',
  bg: '#F4F6FA',
  card: '#FFFFFF',
  text: '#1B2430',
  muted: '#6B7686',
  border: '#E3E8F0',
  danger: '#D64545',
};

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
