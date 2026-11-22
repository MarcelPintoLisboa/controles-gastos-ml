import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth';
import { mensagemErro } from '../supabase';
import { Gradient } from '../components/ui';
import { colors } from '../utils';

export default function LoginScreen() {
  const { entrar, criarConta } = useAuth();
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'criar'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const enviar = async () => {
    setErro('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErro('Informe um e-mail válido.');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    setEnviando(true);
    try {
      if (modo === 'entrar') {
        await entrar(email, senha);
      } else {
        const entrou = await criarConta(email, senha);
        if (!entrou) {
          Alert.alert('Confirme seu e-mail', `Enviamos um link de confirmação para ${email.trim()}. Depois de confirmar, volte e toque em "Entrar".`);
          setModo('entrar');
        }
      }
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <Gradient />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <View style={s.logo}><Ionicons name="wallet" size={34} color={colors.primary} /></View>
            <Text style={s.app}>Controles de gastos ML</Text>
            <Text style={s.sub}>Seus gastos salvos na nuvem, em qualquer aparelho.</Text>

            <View style={s.card}>
              <Text style={s.titulo}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>

              <Text style={s.label}>E-mail</Text>
              <TextInput
                style={s.input} value={email} onChangeText={setEmail} placeholder="voce@exemplo.com"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
                textContentType="emailAddress" placeholderTextColor={colors.muted}
              />

              <Text style={s.label}>Senha</Text>
              <View style={s.senhaBox}>
                <TextInput
                  style={[s.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]} value={senha} onChangeText={setSenha}
                  placeholder="mínimo 6 caracteres" secureTextEntry={!verSenha} autoCapitalize="none"
                  textContentType={modo === 'entrar' ? 'password' : 'newPassword'} placeholderTextColor={colors.muted}
                  onSubmitEditing={enviar} returnKeyType="go"
                />
                <Pressable onPress={() => setVerSenha((v) => !v)} hitSlop={8} style={{ paddingHorizontal: 12 }}>
                  <Ionicons name={verSenha ? 'eye-off' : 'eye'} size={20} color={colors.muted} />
                </Pressable>
              </View>

              {erro ? <Text style={s.erro}>{erro}</Text> : null}

              <Pressable onPress={enviar} disabled={enviando} style={({ pressed }) => [s.botao, (pressed || enviando) && { opacity: 0.8 }]}>
                {enviando ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTxt}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</Text>}
              </Pressable>

              <Pressable onPress={() => { setModo(modo === 'entrar' ? 'criar' : 'entrar'); setErro(''); }} style={{ marginTop: 16 }}>
                <Text style={s.trocar}>
                  {modo === 'entrar' ? 'Não tem conta? ' : 'Já tem conta? '}
                  <Text style={{ fontWeight: '700', color: colors.primary }}>{modo === 'entrar' ? 'Criar conta' : 'Entrar'}</Text>
                </Text>
              </Pressable>
            </View>
            <Text style={s.rodape}>ML Softwares</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logo: { width: 68, height: 68, borderRadius: 20, backgroundColor: '#fff', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  app: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  titulo: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, marginBottom: 14 },
  senhaBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: 14 },
  erro: { color: colors.danger, marginBottom: 12 },
  botao: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  botaoTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  trocar: { textAlign: 'center', color: colors.muted },
  rodape: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 20, fontSize: 12 },
});
