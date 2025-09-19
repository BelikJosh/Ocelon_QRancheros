import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import AppTabs from './pages/AppTabs';
import LoginScreen from './pages/LoginScreen';
import { RootStackParamList } from './navegation/types/navigation';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (

    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}