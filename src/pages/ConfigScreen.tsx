// ConfigScreen.tsx
import * as Linking from 'expo-linking';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// ❗ Ajusta la ruta según dónde tengas tu servicio
// import { DynamoDBService } from '../services/DynamoService';
import { DynamoDBService } from '../services/DynamoService';

// TODO: reemplazar por tu fuente real (contexto de auth)
const useCurrentUser = () => ({
  id: 'USER#1758342031701_4659',
  wallet: 'wallet_1758342031701_4659',
  email: 'josuehernandez3362@gmail.com',
});

function randomNonce(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Payload Open Payment:
 * openpayment://pay?to=<wallet>&amount=<num>&nonce=<str>&ts=<iso>&from=<userId>
 */
export default function ConfigScreen() {
  const CURRENT_USER = useCurrentUser();
  const [amount, setAmount] = useState('123.45');
  const [nonce, setNonce] = useState(randomNonce());
  const [saving, setSaving] = useState(false);

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
  }, [CURRENT_USER.wallet, CURRENT_USER.id, amount, nonce]);

  const regenerate = useCallback(() => {
    setNonce(randomNonce());
  }, []);

const guardarEnNube = useCallback(async () => {
  try {
    setSaving(true);
    await DynamoDBService.actualizarQRUsuario(CURRENT_USER.id, payload); // ✅ directo a Dynamo
    Alert.alert('Listo ✅', 'QR publicado/actualizado en la nube.');
  } catch (e) {
    console.error(e);
    Alert.alert('Error', 'No se pudo guardar el QR en la nube.');
  } finally {
    setSaving(false);
  }
}, [CURRENT_USER.id, payload]);



  const copyToMail = useCallback(async () => {
    try {
      await Linking.openURL(
        `mailto:?subject=QR%20OpenPayment&body=${encodeURIComponent(payload)}`
      );
    } catch (e) {
      Alert.alert('Ups', 'No se pudo compartir el enlace.');
    }
  }, [payload]);

  const testDeepLink = useCallback(async () => {
    // (Opcional) primero guardamos y luego probamos abrir el deep link
    try {
      setSaving(true);
      await DynamoDBService.actualizarQRUsuario(CURRENT_USER.id, payload);
    } catch {}
    setSaving(false);
    Linking.openURL(payload);
  }, [CURRENT_USER.id, payload]);

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

      <TouchableOpacity style={styles.primaryBtn} onPress={regenerate} disabled={saving}>
        <Text style={styles.btnText}>Regenerar QR</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={copyToMail} disabled={saving}>
          <Text style={styles.secondaryText}>Compartir</Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={testDeepLink} disabled={saving}>
          <Text style={styles.secondaryText}>Probar deep link</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={guardarEnNube} disabled={saving}>
        {saving ? <ActivityIndicator /> : <Text style={styles.saveText}>Guardar/Actualizar en la nube</Text>}
      </TouchableOpacity>

      <View style={{ height: 16 }} />
      <Text style={styles.hint}>
        • Al tocar “Guardar/Actualizar en la nube”, se escribe el payload en el campo <Text style={styles.bold}>QR</Text> de tu usuario.
      </Text>
      <Text style={styles.hint}>
        • El **ScannerScreen** también guarda el QR escaneado en AWS y navega a **WalletScreen**.
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
  saveBtn: {
    marginTop: 14,
    backgroundColor: '#42b883',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  saveText: { color: '#0b0b0c', fontWeight: '800' },
  hint: { color: '#9f9faf', fontSize: 12 },
});
