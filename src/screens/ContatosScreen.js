import React from 'react';
import { ScrollView, View, Text, Pressable, Linking, Alert, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title, HeroCard } from '../components/ui';
import { colors } from '../utils';

const FUNDADOR = 'Marcel Lisboa';
const FOTO = require('../../assets/fundador.png');

const CONTATOS = [
  {
    icone: 'logo-whatsapp', cor: '#25D366', rotulo: 'WhatsApp', valor: '(81) 98805-5220',
    url: 'https://wa.me/5581988055220',
  },
  {
    icone: 'logo-instagram', cor: '#E1306C', rotulo: 'Instagram', valor: '@marcellisboa',
    url: 'https://instagram.com/marcellisboa',
  },
  {
    icone: 'mail', cor: colors.primary, rotulo: 'E-mail', valor: 'mapl11@hotmail.com',
    url: 'mailto:mapl11@hotmail.com',
  },
];

// Links https e mailto abrem no iOS e no Android sem configuração extra.
async function abrir(url) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir', 'Verifique se o aplicativo está instalado no celular.');
  }
}

export default function ContatosScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 14 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Fale com a gente</Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Contatos</Text>
        </View>

        <HeroCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Image source={FOTO} style={st.avatar} accessibilityLabel={`Foto de ${FUNDADOR}`} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{FUNDADOR}</Text>
              <View style={st.badge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Fundador do app</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 }}>Desde novembro de 2026</Text>
            </View>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 14, fontSize: 13 }}>
            Controles de gastos ML. Dúvidas, sugestões ou parcerias? Fale comigo por um dos canais abaixo.
          </Text>
        </HeroCard>

        <Card>
          <Title>Canais</Title>
          {CONTATOS.map((c, i) => (
            <Pressable
              key={c.rotulo}
              onPress={() => abrir(c.url)}
              accessibilityRole="link"
              accessibilityLabel={`${c.rotulo}: ${c.valor}`}
              style={({ pressed }) => [st.linha, i > 0 && st.divisor, pressed && { opacity: 0.6 }]}
            >
              <View style={[st.icone, { backgroundColor: c.cor }]}>
                <Ionicons name={c.icone} size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{c.rotulo}</Text>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{c.valor}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  avatar: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fff', backgroundColor: '#fff',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divisor: { borderTopWidth: 1, borderTopColor: colors.border },
  icone: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
