import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si aún no sabemos el estado del permiso
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.info}>Verificando permisos…</Text>
      </View>
    );
  }

  // Si está denegado, mostramos UI para pedirlo/abrir ajustes
  if (!permission.granted) {
    return (
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
  }

  const onBarcodeScanned = useCallback(({ data, type }: { data: string; type: string }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    // TODO: aquí haces lo que necesites con el QR (navegar, llamar API, etc.)
    // Ejemplo simple: mostrar una alerta y permitir volver a escanear:
    setTimeout(() => {
      setLoading(false);
      alert(`QR detectado:\n${data}`);
      setScanned(false); // permitir otro escaneo
    }, 500);
  }, [scanned]);

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Apunta al código QR</Text>
        {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
      </View>
      {/* Marco guía */}
      <View pointerEvents="none" style={styles.frame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  info: { fontSize: 14, color: '#666', textAlign: 'center' },
  primaryBtn: { marginTop: 16, backgroundColor: '#6C63FF', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { marginTop: 10, padding: 8 },
  secondaryText: { color: '#6C63FF', fontWeight: '500' },
  overlay: { position: 'absolute', top: 40, alignSelf: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
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
