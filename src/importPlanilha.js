import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { parseValor } from './utils';

// Remove acentos e padroniza para comparar textos ("Obrigações" -> "obrigacoes")
const ACENTOS = { á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a', é: 'e', ê: 'e', è: 'e', í: 'i', î: 'i', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ú: 'u', ü: 'u', ç: 'c' };
const norm = (v) =>
  String(v ?? '')
    .toLowerCase()
    .replace(/[áàâãäéêèíîóôõöúüç]/g, (c) => ACENTOS[c])
    .replace(/\s+/g, ' ')
    .trim();

const MESES_NORM = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Abre o seletor de arquivos e lê a planilha. Retorna null se o usuário cancelar.
export async function escolherPlanilha() {
  const res = await DocumentPicker.getDocumentAsync({
    type: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'text/comma-separated-values',
      'public.comma-separated-values-text',
      '*/*',
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets?.length) return null;
  const arquivo = res.assets[0];
  const b64 = await FileSystem.readAsStringAsync(arquivo.uri, { encoding: FileSystem.EncodingType.Base64 });
  const wb = XLSX.read(b64, { type: 'base64' }); // datas chegam como número do Excel
  if (!wb.SheetNames.length) throw new Error('A planilha não tem nenhuma aba.');
  return { nomeArquivo: arquivo.name, wb, abas: wb.SheetNames };
}

function lerMes(v) {
  if (v instanceof Date && !isNaN(v)) return v.getMonth() + 1;
  if (typeof v === 'number') {
    if (v >= 1 && v <= 12 && Number.isInteger(v)) return v;
    if (v > 59) {
      // número de data do Excel
      const d = XLSX.SSF.parse_date_code(v);
      return d ? d.m : null;
    }
    return null;
  }
  const s = norm(v);
  if (!s) return null;
  if (/^\d{1,2}$/.test(s)) {
    const n = Number(s);
    return n >= 1 && n <= 12 ? n : null;
  }
  // dd/mm/aaaa ou mm/aaaa
  let m = /^\d{1,2}\/(\d{1,2})\/\d{2,4}$/.exec(s) || /^(\d{1,2})\/\d{4}$/.exec(s);
  if (m) {
    const n = Number(m[1]);
    return n >= 1 && n <= 12 ? n : null;
  }
  const idx = MESES_NORM.indexOf(s.slice(0, 3));
  return idx >= 0 ? idx + 1 : null;
}

function lerValor(v) {
  if (typeof v === 'number') return v;
  if (!/\d/.test(String(v ?? ''))) return NaN; // célula vazia ou sem número
  return parseValor(v);
}

function lerStatus(v) {
  const s = norm(v);
  if (s.includes('a pagar') || s.includes('pendente') || s.includes('aberto')) return 'A pagar';
  return s.startsWith('pago') || s === 'sim' || s === 'ok' ? 'Pago' : 'A pagar';
}

// Lê a aba escolhida. Colunas esperadas: Obrigações, Valor, Mês, Status.
export function lerAba(wb, aba, ano) {
  const ws = wb.Sheets[aba];
  const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });

  // procura a linha de cabeçalho nas primeiras 15 linhas
  let hIdx = -1;
  let col = {};
  for (let r = 0; r < Math.min(15, linhas.length); r++) {
    const c = {};
    linhas[r].forEach((cel, i) => {
      const h = norm(cel);
      if (c.nome === undefined && h.startsWith('obriga')) c.nome = i;
      else if (c.valor === undefined && h.startsWith('valor')) c.valor = i;
      else if (c.mes === undefined && (h === 'mes' || h.startsWith('mes '))) c.mes = i;
      else if (c.status === undefined && h.startsWith('status')) c.status = i;
    });
    if (c.nome !== undefined && c.valor !== undefined && c.mes !== undefined) {
      hIdx = r;
      col = c;
      break;
    }
  }
  if (hIdx < 0) {
    throw new Error(`A aba "${aba}" precisa ter as colunas Obrigações, Valor, Mês e Status.`);
  }

  const itens = [];
  const erros = [];
  for (let r = hIdx + 1; r < linhas.length; r++) {
    const l = linhas[r];
    const nome = String(l[col.nome] ?? '').trim();
    const vazio = !nome && l[col.valor] === '' && l[col.mes] === '';
    if (vazio) continue;
    const valor = lerValor(l[col.valor]);
    const mes = lerMes(l[col.mes]);
    if (!nome || !Number.isFinite(valor) || !mes) {
      erros.push(r + 1); // número da linha na planilha
      continue;
    }
    const status = col.status !== undefined ? lerStatus(l[col.status]) : 'A pagar';
    itens.push({ nome, valor: Math.round(valor * 100) / 100, mes, ano, status, dataPagamento: null });
  }
  return { itens, erros };
}
