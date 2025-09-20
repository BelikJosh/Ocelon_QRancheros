import React from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.center}>
        {/* Coloca tu logo en assets/logo.png */}
        <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />
        <Text style={s.title}>Park easily, pay quickly, live better</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logo: { width: 180, height: 180, marginBottom: 16 },
  title: { fontSize: 18, textAlign: 'center', fontWeight: '600', color: '#222' },
});
