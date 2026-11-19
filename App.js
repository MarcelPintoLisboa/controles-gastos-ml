import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StoreProvider } from './src/store';
import ResumoScreen from './src/screens/ResumoScreen';
import FaltamScreen from './src/screens/FaltamScreen';
import LancamentosScreen from './src/screens/LancamentosScreen';
import AjustesScreen from './src/screens/AjustesScreen';
import { colors } from './src/utils';

const Tab = createBottomTabNavigator();
const icons = {
  Resumo: 'pie-chart',
  Faltam: 'time',
  Lançamentos: 'list',
  Ajustes: 'settings',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
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
          </Tab.Navigator>
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
