// WalletScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

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

function shorten(s?: string, head = 14, tail = 8) {
  if (!s) return '—';
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
function money(mx?: string) {
  const n = Number(mx ?? '0');
  if (!isFinite(n)) return '$0.00 MXN';
  return `$${n.toFixed(2)} MXN`;
}

export default function WalletScreen() {
  const route = useRoute<any>();
  const qr: QrPayload = route.params?.qr ?? {};

  // ====== Escalas responsivas ======
  const { width, height } = useWindowDimensions();
  const BASE_W = 375, BASE_H = 812;
  const hs = (n: number) => (width / BASE_W) * n;                // horizontalScale
  const vs = (n: number) => (height / BASE_H) * n;               // verticalScale
  const ms = (n: number, f = 0.5) => n + (hs(n) - n) * f;        // moderateScale

  // Tokens
  const PADDING = hs(18);
  const RADIUS = hs(18);
  const ICON = ms(18);
  const MAX_W = Math.min(560, width - hs(32));

  const summary = useMemo(
    () => ({
      walletDestino: qr.to ?? 'N/D',
      monto: qr.amount ?? '0',
      referencia: qr.nonce ?? '—',
      timestamp: qr.ts ?? '—',
      origen: qr.from ?? '—',
      raw: qr.raw,
      scheme: (qr.scheme ?? 'openpayment').toUpperCase(),
    }),
    [qr]
  );

  const confirmar = () => {
    Alert.alert('Pago simulado', `Pago enviado a ${summary.walletDestino} por ${money(summary.monto)}`);
  };
  const cancelar = () => Alert.alert('Cancelado', 'Operación cancelada');

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={[s.scroll, { padding: PADDING }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header */}
        <View style={[s.header, { maxWidth: MAX_W }]}>
          <View style={s.headerLeft}>
            <View style={[s.headerIcon, { borderRadius: hs(12) }]}>
              <Ionicons name="wallet-outline" size={ms(20)} color="#42b883" />
            </View>
            <View>
              <Text style={[s.title, { fontSize: ms(22) }]}>Wallet</Text>
              <Text style={[s.subtitle, { fontSize: ms(12) }]}>Simulación de pago Open Payments</Text>
            </View>
          </View>

          <View style={[s.badge, { borderRadius: 999, paddingHorizontal: hs(10), paddingVertical: vs(6) }]}>
            <Ionicons name="shield-checkmark-outline" size={ms(14)} color="#0b0b0c" />
            <Text style={[s.badgeText, { fontSize: ms(12) }]}>{summary.scheme}</Text>
          </View>
        </View>

        {/* Card monto + destino */}
        <View
          style={[
            s.amountCard,
            {
              maxWidth: MAX_W,
              borderRadius: RADIUS,
              padding: hs(16),
            },
          ]}
        >
          <Text style={[s.amountLabel, { fontSize: ms(12) }]}>Monto</Text>

          <Text
            style={[s.amount, { fontSize: ms(36), marginBottom: vs(6) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {money(summary.monto)}
          </Text>

          <View style={[s.destRow, { gap: hs(8) }]}>
            <Ionicons name="arrow-forward-circle" size={ICON} color="#cfcfff" />
            <Text style={[s.destLabel, { fontSize: ms(12) }]}>Destino</Text>
            <Text style={[s.destValue, { fontSize: ms(13) }]} numberOfLines={1}>
              {shorten(summary.walletDestino)}
            </Text>
          </View>
        </View>

        {/* Detalles */}
        <View
          style={[
            s.card,
            { maxWidth: MAX_W, borderRadius: RADIUS, padding: hs(14) },
          ]}
        >
          <DetailRow
            hs={hs}
            icon={<Ionicons name="person-outline" size={ICON} color="#9aa0a6" />}
            label="Origen"
            value={shorten(summary.origen)}
          />
          <DetailRow
            hs={hs}
            icon={<Ionicons name="pricetag-outline" size={ICON} color="#9aa0a6" />}
            label="Referencia"
            value={summary.referencia}
          />
          <DetailRow
            hs={hs}
            icon={<Ionicons name="time-outline" size={ICON} color="#9aa0a6" />}
            label="Timestamp"
            value={summary.timestamp}
          />
          {!!summary.raw && (
            <DetailRow
              hs={hs}
              icon={<Ionicons name="document-text-outline" size={ICON} color="#9aa0a6" />}
              label="Payload"
              value={shorten(summary.raw, 22, 12)}
            />
          )}
        </View>

        {/* Acciones */}
        <View style={[s.actions, { maxWidth: MAX_W, gap: vs(10) }]}>
          <TouchableOpacity style={[s.btn, s.confirm, { borderRadius: hs(12), paddingVertical: vs(14) }]} onPress={confirmar}>
            <Ionicons name="checkmark-circle" size={ms(18)} color="#0b0b0c" />
            <Text style={[s.btnText, { fontSize: ms(15) }]}>Confirmar pago</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, s.cancel, { borderRadius: hs(12), paddingVertical: vs(14) }]}
            onPress={cancelar}
          >
            <Ionicons name="close-circle" size={ms(18)} color="#fff" />
            <Text style={[s.btnTextAlt, { fontSize: ms(15) }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Nota */}
        <View style={{ maxWidth: MAX_W, width: '100%' }}>
          <View style={[s.helper, { borderRadius: hs(12), padding: hs(10) }]}>
            <Ionicons name="information-circle-outline" size={ms(16)} color="#9aa0a6" />
            <Text style={[s.helperText, { fontSize: ms(12) }]}>
              Esta vista es de prueba. El botón “Confirmar pago” solo muestra un alert simulando el envío.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fondo decorativo */}
      <Image
        source={require('../../assets/images/Logo_ocelon.jpg')}
        style={{
          position: 'absolute',
          opacity: 0.04,
          width: width * 0.7,
          height: width * 0.7,
          bottom: -vs(40),
          right: -hs(20),
          borderRadius: hs(20),
        }}
        resizeMode="cover"
      />
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  hs,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  hs: (n: number) => number;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: hs(10), paddingVertical: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: hs(8), flexShrink: 0 }}>
        {icon}
        <Text style={{ color: '#a0a0a0' }}>{label}</Text>
      </View>
      <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 'auto', maxWidth: '66%', textAlign: 'right' }} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0c' },
  scroll: { alignItems: 'center', gap: 14, marginTop:100 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 40, height: 40, backgroundColor: '#121215', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1f1f25',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }, android: { elevation: 4 } }),
  },
  title: { color: '#fff', fontWeight: '800' },
  subtitle: { color: '#bdbdbd' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#42b883' },
  badgeText: { color: '#0b0b0c', fontWeight: '800' },

  amountCard: {
    width: '100%',
    backgroundColor: '#131318',
    borderWidth: 1,
    borderColor: '#202028',
  },
  amountLabel: { color: '#9f9faf', letterSpacing: 0.4 },
  amount: { color: '#ffffff', fontWeight: '900' },
  destRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 2 },
  destLabel: { color: '#9f9faf' },
  destValue: { color: '#cfcfff', fontWeight: '700', marginLeft: 'auto' },

  card: {
    width: '100%',
    backgroundColor: '#151518',
    borderWidth: 1,
    borderColor: '#202028',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 3 } }),
  },

  actions: { width: '100%' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },
  confirm: { backgroundColor: '#42b883' },
  cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3a3a42' },
  btnText: { color: '#0b0b0c', fontWeight: '800' },
  btnTextAlt: { color: '#fff', fontWeight: '800' },

  helper: { backgroundColor: '#14141a', borderWidth: 1, borderColor: '#202028', flexDirection: 'row', alignItems: 'center', gap: 8 },
  helperText: { color: '#9aa0a6' },
});
