import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

const Ctx = createContext(null);

// Guarda a sessão do usuário logado (Supabase Auth) e expõe entrar/criar conta/sair.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setPronto(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      pronto,
      entrar: async (email, senha) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) throw error;
      },
      // Retorna true se a conta já entrou direto; false se precisa confirmar o e-mail
      criarConta: async (email, senha) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
          options: { data: { app: 'Controles de gastos ML' } }, // aparece em usuarios.app_cadastro
        });
        if (error) throw error;
        return Boolean(data.session);
      },
      sair: () => supabase.auth.signOut(),
    }),
    [session, pronto]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
