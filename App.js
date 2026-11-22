import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StoreProvider, useStore } from './src/store';
import { AuthProvider, useAuth } from './src/auth';
import LoginScreen from './src/screens/LoginScreen';
import ResumoScreen from './src/screens/ResumoScreen';
import FaltamScreen from './src/screens/FaltamScreen';
import LancamentosScreen from './src/screens/LancamentosScreen';
import AjustesScreen from './src/screens/AjustesScreen';
import ContatosScreen from './src/screens/ContatosScreen';
import { colors } from './src/utils';

const Tab = createBottomTabNavigator();
const icons = {
  Resumo: 'pie-chart',
  Faltam: 'time',
  Lançamentos: 'list',
  Ajustes: 'settings',
  Contatos: 'people',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Portao />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function Centro({ children }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}>
      {children}
    </View>
  );
}

// Sem login: tela de entrar. Com login: carrega os dados da base e mostra o app.
function Portao() {
  const { pronto, user } = useAuth();
  if (!pronto) return <Centro><ActivityIndicator color={colors.primary} size="large" /></Centro>;
  if (!user) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen />
      </>
    );
  }
  return (
    <StoreProvider>
      <Carregamento />
    </StoreProvider>
  );
}

function Carregamento() {
  const { loaded, erroCarga, recarregar, items } = useStore();
  const { sair } = useAuth();
  if (!loaded) {
    return (
      <Centro>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ marginTop: 12, color: colors.muted }}>Carregando seus dados…</Text>
      </Centro>
    );
  }
  if (erroCarga && !items.length) {
    return (
      <Centro>
        <Ionicons name="cloud-offline" size={48} color={colors.muted} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 12 }}>Sem conexão</Text>
        <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>{erroCarga}</Text>
        <Pressable
          onPress={recarregar}
          style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28, marginTop: 20 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Tentar de novo</Text>
        </Pressable>
        <Pressable onPress={sair} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.primary }}>Sair da conta</Text>
        </Pressable>
      </Centro>
    );
  }
  return <Abas />;
}

function Abas() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarStyle: {
            borderTopWidth: 0, backgroundColor: '#fff',
            shadowColor: '#312E81', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12,
          },
          tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
        })}
      >
        <Tab.Screen name="Resumo" component={ResumoScreen} />
        <Tab.Screen name="Faltam" component={FaltamScreen} options={{ title: 'A pagar' }} />
        <Tab.Screen name="Lançamentos" component={LancamentosScreen} />
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
        <Tab.Screen name="Contatos" component={ContatosScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
