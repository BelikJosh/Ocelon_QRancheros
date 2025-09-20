// ScannerScreen.tsx (versión sin returns tempranos)
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveScannedQrByUserId } from '../services/api';

// Si ya tienes el id en tu contexto/auth, úsalo desde ahí
const CURRENT_USER_ID = 'USER#1758339411234_5487';

function parseOpenPaymentPayload(data: string) {
  const tryParse = (urlStr: string) => {
    const u = new URL(urlStr);
    const params = Object.fromEntries(u.searchParams.entries());
    return {
      scheme: u.protocol.replace(':', ''),
      path: (u.hostname ? `/${u.hostname}` : '') + (u.pathname || ''),
      ...params,
      raw: data,
    };
  };
  try {
    if (data.startsWith('openpayment://')) {
      const normalized = data.replace('openpayment://', 'https://openpayment.local/');
      const parsed = tryParse(normalized);
      parsed.scheme = 'openpayment';
      parsed.path = '/pay';
      return parsed;
    }
    return tryParse(data);
  } catch {
    return { raw: data };
  }
}

export default function ScannerScreen() {
  // ✅ TODOS los hooks arriba, sin returns antes
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const onBarcodeScanned = useCallback(
    async ({ data }: { data: string; type?: string }) => {
      if (scanned) return;
      setScanned(true);
      setLoading(true);
      try {
        await saveScannedQrByUserId(CURRENT_USER_ID, data);
        const parsed = parseOpenPaymentPayload(data);
        navigation.navigate('Wallet', { qr: parsed });
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo guardar el QR. Intenta de nuevo.');
      } finally {
        setLoading(false);
        setTimeout(() => setScanned(false), 600);
      }
    },
    [scanned, navigation]
  );

  // 👇 En lugar de return temprano, componemos el contenido condicional
  let content: React.ReactNode = null;

  if (!permission) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.info}>Verificando permisos…</Text>
      </View>
    );
  } else if (!permission.granted) {
    content = (
      <View style={styles.center}>
        <Text style={styles.title}>Necesitamos acceso a la cámara</Text>
        <Text style={styles.info}>Para escanear códigos QR, permite el acceso a la cámara.</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder permiso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => Linking.openSettings()}>
          <Text style={styles.secondaryText}>Abrir ajustes</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={onBarcodeScanned as any} // cast por compatibilidad de tipos
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Apunta al código QR</Text>
          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
        </View>
        <View pointerEvents="none" style={styles.frame} />
      </>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center', color: '#fff' },
  info: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  primaryBtn: { marginTop: 16, backgroundColor: '#6C63FF', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { marginTop: 10, padding: 8 },
  secondaryText: { color: '#6C63FF', fontWeight: '500' },
  overlay: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  overlayTitle: { color: '#fff', fontWeight: '600' },
  frame: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'center',
    top: '28%',
  },
});
