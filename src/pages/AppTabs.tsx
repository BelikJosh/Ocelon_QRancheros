import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// ------------ Pantallas ------------
function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={s.center}>
        <Image
          source={require('../../assets/images/Logo_ocelon.jpg')}
          resizeMode="contain"
          style={s.logo}
        />
        <Text style={s.tagline}>Park easily, pay quickly, live better</Text>
      </View>
    </SafeAreaView>
  );
}

function WalletScreen() {
  return (<View style={s.center}><Text>Wallet Screen</Text></View>);
}
function MapScreen() {
  return (<View style={s.center}><Text>Map Screen</Text></View>);
}
function ConfigScreen() {
  return (<View style={s.center}><Text>Config Screen</Text></View>);
}

// Importa la pantalla de escáner (ya creada por ti)
import ScannerScreen from './ScannerScreen'; // ajusta la ruta si es necesario

// ------------ Tabs ------------
const Tab = createBottomTabNavigator();

function ScannerTabButton(props: any) {
  const { onPress, accessibilityState } = props;
  const focused = accessibilityState?.selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.scannerButton}
      accessibilityRole="button"
      accessibilityLabel="Open QR Scanner"
      accessibilityState={{ selected: !!focused }}
    >
      <MaterialIcons name="qr-code-scanner" size={34} color="#fff" />
    </TouchableOpacity>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: { height: 64 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="wallet" size={size} color={color} />,
          tabBarLabel: 'Wallet',
        }}
      />

      {/* Botón central: abre ScannerScreen y ahí pides permisos/escaneas */}
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <ScannerTabButton {...props} />,
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
          tabBarLabel: 'Map',
        }}
      />

      <Tab.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          tabBarLabel: 'Config',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scannerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f39c12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // lo eleva
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
  },
});

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logo: { width: 180, height: 180, marginBottom: 12 },
  tagline: { fontSize: 16, textAlign: 'center', fontWeight: '600', color: '#222' },
});
