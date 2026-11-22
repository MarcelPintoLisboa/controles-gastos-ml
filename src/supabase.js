// Conexão com a base de dados (Supabase) da ML Softwares.
// A chave anon/publishable é pública por natureza: a segurança fica nas regras (RLS) do banco,
// onde cada usuário só acessa os próprios dados. NUNCA coloque aqui a chave service_role/secret.
import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://eoowbybfrbmjxcjfniuu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_n5kj7FP4nEklOtYOt5GgKw_GpRUXs_t';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renova o login automaticamente só com o app aberto (recomendação do Supabase para React Native)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

// Mensagem amigável para erros de rede / banco
export function mensagemErro(e) {
  const msg = String(e?.message || e || '');
  if (/network|fetch|timeout|internet|Failed to fetch/i.test(msg)) {
    return 'Sem conexão com a internet. Verifique a rede e tente de novo.';
  }
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/Email not confirmed/i.test(msg)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (/User already registered/i.test(msg)) return 'Já existe uma conta com este e-mail. Use "Entrar".';
  if (/Password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/JWT|session|not authenticated/i.test(msg)) return 'Sua sessão expirou. Entre novamente.';
  return msg || 'Erro inesperado.';
}
