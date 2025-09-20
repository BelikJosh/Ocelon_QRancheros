// src/services/opApi.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function guessBaseUrl() {
  // 1) Si configuraste extra.apiUrl en app.config.js -> úsalo
  const extra = (Constants.expoConfig?.extra || (Constants as any).manifest?.extra) as any;
  if (extra?.apiUrl) return extra.apiUrl as string;

  // 2) Derivar host del bundler (útil en dispositivo físico con Expo Go)
  // hostUri ejemplos: "192.168.1.23:19000", "exp://..."
  const hostUri: string | undefined =
    (Constants as any).expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.hostUri;

  let host = hostUri?.split(':')?.[0];

  // 3) Ajustes por plataforma/emulador
  if (Platform.OS === 'android') {
    // Emulador Android no accede a localhost del host; usa 10.0.2.2
    if (!host || host === 'localhost' || host === '127.0.0.1') host = '10.0.2.2';
  } else if (Platform.OS === 'ios') {
    // iOS simulador sí usa 127.0.0.1
    if (!host || host === 'localhost') host = '127.0.0.1';
  }

  // Fallback final si no se pudo obtener host
  host = host || '127.0.0.1';

  return `http://${host}:3001`;
}

const BASE_URL = guessBaseUrl();

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* noop */ }

    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data as T;
  } catch (err: any) {
    console.log('[HTTP ERROR]', BASE_URL + path, err?.message, err?.stack);
    throw err;
  }
}

export const opApi = {
  async wallets() {
    return http('/op/wallets', { method: 'GET' });
  },
  async createIncoming(receiveValueMinor: string) {
    return http('/op/incoming', {
      method: 'POST',
      body: JSON.stringify({ receiveValueMinor }),
    }) as Promise<{ ok: true; incomingPayment: { id: string } }>;
  },
  async startOutgoing(incomingPaymentId: string) {
    return http('/op/outgoing/start', {
      method: 'POST',
      body: JSON.stringify({ incomingPaymentId }),
    }) as Promise<{ ok: true; redirectUrl: string; continueUri: string; continueAccessToken: string }>;
  },
  async finishOutgoing(params: {
    incomingPaymentId: string;
    continueUri: string;
    continueAccessToken: string;
    interact_ref: string;
  }) {
    return http('/op/outgoing/finish', {
      method: 'POST',
      body: JSON.stringify(params),
    }) as Promise<{ ok: true; outgoingPayment: { id: string } }>;
  },
};
