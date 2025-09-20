// WalletScreen.tsx
import { useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type QrPayload = {
  raw?: string;
  scheme?: string;
  path?: string;
  to?: string;
  amount?: string;
  nonce?: string;
  ts?: string;
  from?: string;
};

export default function WalletScreen() {
  const route = useRoute<any>();
  const qr: QrPayload = route.params?.qr ?? {};

  const summary = useMemo(() => ({
    walletDestino: qr.to ?? 'N/D',
    monto: qr.amount ?? '0',
    referencia: qr.nonce ?? '—',
    timestamp: qr.ts ?? '—',
    origen: qr.from ?? '—',
    raw: qr.raw,
  }), [qr]);

  const confirmar = () => {
    Alert.alert('Pago simulado', `Pago enviado a ${summary.walletDestino} por $${summary.monto}`);
  };
  const cancelar = () => {
    Alert.alert('Cancelado', 'Operación cancelada');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>
      <Text style={styles.subtitle}>Simulación de pago Open Payment</Text>

      <View style={styles.card}>
        <Row label="Destino" value={summary.walletDestino} />
        <Row label="Monto" value={`$${summary.monto}`} />
        <Row label="Referencia" value={summary.referencia} />
        <Row label="Timestamp" value={summary.timestamp} />
        <Row label="Origen" value={summary.origen} />
        {summary.raw && <Row label="Raw" value={summary.raw} />}
      </View>

      <TouchableOpacity style={[styles.btn, styles.confirm]} onPress={confirmar}>
        <Text style={styles.btnText}>Confirmar pago</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={cancelar}>
        <Text style={styles.btnText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14, backgroundColor: '#0b0b0c' },
  title: { color: 'white', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#bdbdbd' },
  card: { backgroundColor: '#151518', borderRadius: 16, padding: 14, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { color: '#a0a0a0' },
  value: { color: '#fff', fontWeight: '600', flex: 1, textAlign: 'right' },
  btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  confirm: { backgroundColor: '#42b883' },
  cancel: { backgroundColor: '#f05454' },
  btnText: { color: '#fff', fontWeight: '700' },
});
