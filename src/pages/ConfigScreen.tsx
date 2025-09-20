// ConfigScreen.tsx
import * as Linking from 'expo-linking';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// ⚠️ Reemplaza por tu fuente real de usuario (contexto de auth)
const CURRENT_USER = {
  id: 'USER#1758342031701_4659',
  wallet: 'wallet_1758342031701_4659',
  email: 'josuehernandez3362@gmail.com',
};

function randomNonce(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Payload que tu ScannerScreen ya sabe parsear:
 * openpayment://pay?to=<wallet>&amount=<num>&nonce=<str>&ts=<iso>&from=<userId>
 */
export default function ConfigScreen() {
  const [amount, setAmount] = useState('123.45');
  const [nonce, setNonce] = useState(randomNonce());

  const payload = useMemo(() => {
    const ts = new Date().toISOString();
    const params = new URLSearchParams({
      to: CURRENT_USER.wallet,
      amount: String(amount || '0'),
      nonce,
      ts,
      from: CURRENT_USER.id,
    }).toString();

    return `openpayment://pay?${params}`;
  }, [amount, nonce]);

  const regenerate = useCallback(() => {
    setNonce(randomNonce());
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      // Evita dependencias extras: el share nativo del deep link es suficiente
      await Linking.openURL(`mailto:?subject=QR%20OpenPayment&body=${encodeURIComponent(payload)}`);
      // Si prefieres copiar, instala expo-clipboard:
      // import * as Clipboard from 'expo-clipboard';
      // await Clipboard.setStringAsync(payload);
      // Alert.alert('Copiado', 'Payload copiado al portapapeles.');
    } catch (e) {
      Alert.alert('Ups', 'No se pudo compartir el enlace.');
    }
  }, [payload]);

  const testDeepLink = useCallback(() => {
    // Abrir el deep link en el mismo dispositivo (útil cuando ya tienes linking configurado)
    Linking.openURL(payload);
  }, [payload]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Cobro</Text>
      <Text style={styles.subtitle}>
        Genera un QR de pago. Al escanearlo con <Text style={styles.bold}>Scanner</Text>, se guardará en AWS y
        navegará a <Text style={styles.bold}>Wallet</Text>.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Wallet destino</Text>
        <Text style={styles.mono}>{CURRENT_USER.wallet}</Text>

        <Text style={[styles.label, { marginTop: 14 }]}>Monto</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#7d7d85"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Nonce</Text>
        <Text style={styles.mono}>{nonce}</Text>
      </View>

      <View style={styles.qrBox}>
        <QRCode value={payload} size={240} />
      </View>

      <Text style={styles.small} numberOfLines={2}>
        Deep link: <Text style={styles.mono}>{payload}</Text>
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={regenerate}>
        <Text style={styles.btnText}>Regenerar QR</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={copyToClipboard}>
          <Text style={styles.secondaryText}>Compartir</Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={testDeepLink}>
          <Text style={styles.secondaryText}>Probar deep link</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 16 }} />
      <Text style={styles.hint}>
        • El **ScannerScreen** ya se encarga de **guardar el QR en AWS (campo `QR`)** y de navegar a **WalletScreen**.
      </Text>
      <Text style={styles.hint}>
        • Asegúrate de que tu **WalletScreen** reciba `route.params.qr` para simular el pago.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14, backgroundColor: '#0b0b0c' },
  title: { color: 'white', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#bdbdbd' },
  bold: { fontWeight: '700', color: '#fff' },
  card: { marginTop: 8, backgroundColor: '#151518', borderRadius: 16, padding: 14, gap: 8 },
  label: { color: '#a0a0a0', fontSize: 13 },
  mono: { color: '#fff', fontFamily: 'monospace' as any },
  input: {
    color: '#fff',
    backgroundColor: '#1b1b20',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: '600',
  },
  qrBox: { alignSelf: 'center', padding: 12, backgroundColor: 'white', borderRadius: 16, marginTop: 10 },
  small: { color: '#9f9faf' },
  primaryBtn: { marginTop: 12, backgroundColor: '#6C63FF', paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', marginTop: 10 },
  secondaryBtn: {
    backgroundColor: '#202028',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryText: { color: '#cfcfff', fontWeight: '600' },
  hint: { color: '#9f9faf', fontSize: 12 },
});
