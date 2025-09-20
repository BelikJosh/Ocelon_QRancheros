// index.js (ESM)
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Open Payments (CJS → import default y desestructurar) ─────────────────────
import openPayments from '@interledger/open-payments';
const { createAuthenticatedClient, isFinalizedGrant } = openPayments;

// ─── Utils de ruta robustos (Windows/ESM) ──────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const r = (p) => path.isAbsolute(p) ? p : path.resolve(__dirname, p);

// ─── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
// CORS amplio para pruebas (ajusta origin en prod)
app.use(cors({ origin: true, credentials: true }));

// ─── ENV ───────────────────────────────────────────────────────────────────────
const {
  PORT = 3001,
  // Receiver (cobra USD)
  RECEIVER_WALLET_ADDRESS_URL,
  RECEIVER_KEY_ID,
  RECEIVER_PRIVATE_KEY_PATH,
  // Sender (paga MXN)
  SENDER_WALLET_ADDRESS_URL,
  SENDER_KEY_ID,
  SENDER_PRIVATE_KEY_PATH,
  // Redirect deep link (Expo)
  FINISH_REDIRECT_URL = 'ocelon://pay/finish'
} = process.env;

// Diagnóstico temprano de .env
const required = [
  'RECEIVER_WALLET_ADDRESS_URL',
  'RECEIVER_KEY_ID',
  'RECEIVER_PRIVATE_KEY_PATH',
  'SENDER_WALLET_ADDRESS_URL',
  'SENDER_KEY_ID',
  'SENDER_PRIVATE_KEY_PATH'
];
const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length) {
  console.error('❌ Faltan variables en .env:', missing);
  console.error('ℹ️  Asegúrate de tener server/.env y rutas válidas.');
  process.exit(1);
}

// ─── Cargar claves (ruta robusta y mensaje útil) ──────────────────────────────
const recvKeyPath = r(RECEIVER_PRIVATE_KEY_PATH);
const sendKeyPath = r(SENDER_PRIVATE_KEY_PATH);

if (!fs.existsSync(recvKeyPath)) {
  console.error(`❌ No existe RECEIVER_PRIVATE_KEY_PATH: ${recvKeyPath}`);
  process.exit(1);
}
if (!fs.existsSync(sendKeyPath)) {
  console.error(`❌ No existe SENDER_PRIVATE_KEY_PATH: ${sendKeyPath}`);
  process.exit(1);
}

const receiverPrivateKey = fs.readFileSync(recvKeyPath, 'utf8');
const senderPrivateKey   = fs.readFileSync(sendKeyPath, 'utf8');

// ↓↓↓ añade validateResponses:false
const receiverClient = await createAuthenticatedClient({
  walletAddressUrl: RECEIVER_WALLET_ADDRESS_URL,
  keyId: RECEIVER_KEY_ID,
  privateKey: receiverPrivateKey,
  validateResponses: false,      // 👈 workaround Windows
});

const senderClient = await createAuthenticatedClient({
  walletAddressUrl: SENDER_WALLET_ADDRESS_URL,
  keyId: SENDER_KEY_ID,
  privateKey: senderPrivateKey,
  validateResponses: false,      // 👈 workaround Windows
});


// Ayuda para inspección manual en Postman/insomnia
async function getWalletDocs() {
  const [senderWallet, receiverWallet] = await Promise.all([
    senderClient.walletAddress.get({ url: SENDER_WALLET_ADDRESS_URL }),
    receiverClient.walletAddress.get({ url: RECEIVER_WALLET_ADDRESS_URL })
  ]);
  return { senderWallet, receiverWallet };
}

// ─── Health & debug ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/op/wallets', async (_req, res) => {
  try {
    const docs = await getWalletDocs();
    res.json({ ok: true, ...docs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'wallets failed' });
  }
});

// ─── 1) Crear Incoming Payment (receptor) ─────────────────────────────────────
/**
 * POST /op/incoming
 * body: { receiveValueMinor?: string }  // default "1000" (p.ej. 10.00 si scale=2)
 */
app.post('/op/incoming', async (req, res) => {
  try {
    const { receiverWallet } = await getWalletDocs();
    const receiveValueMinor = (req.body?.receiveValueMinor ?? '1000').toString();

    // Grant en auth del receptor
    const incomingGrant = await receiverClient.grant.request(
      { url: receiverWallet.authServer },
      { access_token: { access: [{ type: 'incoming-payment', actions: ['create','read','list'] }] } }
    );
    if (!isFinalizedGrant(incomingGrant)) throw new Error('Incoming grant no finalizado');

    // Crear Incoming Payment en RS del receptor
    const incomingPayment = await receiverClient.incomingPayment.create(
      { url: receiverWallet.resourceServer, accessToken: incomingGrant.access_token.value },
      {
        walletAddress: receiverWallet.id,
        incomingAmount: {
          assetCode: receiverWallet.assetCode,
          assetScale: receiverWallet.assetScale,
          value: receiveValueMinor
        }
      }
    );

    res.json({ ok: true, incomingPayment });
  } catch (e) {
    console.error('incoming error:', e?.response?.data || e);
    res.status(500).json({ ok:false, error: e?.message || 'incoming failed' });
  }
});

// ─── 2) Iniciar grant OUTGOING (interactivo, remitente) ───────────────────────
/**
 * POST /op/outgoing/start
 * body: { incomingPaymentId: string }
 * → devuelve: { redirectUrl, continueUri, continueAccessToken }
 */
app.post('/op/outgoing/start', async (req, res) => {
  try {
    const { senderWallet } = await getWalletDocs();
    const { incomingPaymentId } = req.body || {};
    if (!incomingPaymentId) return res.status(400).json({ ok:false, error:'incomingPaymentId requerido' });

    const pendingOutgoingGrant = await senderClient.grant.request(
      { url: senderWallet.authServer },
      {
        access_token: {
          access: [{ identifier: senderWallet.id, type: 'outgoing-payment', actions: ['read','create'] }]
        },
        interact: {
          start: ['redirect'],
          finish: { method: 'redirect', uri: FINISH_REDIRECT_URL, nonce: Math.random().toString(36).slice(2) }
        }
      }
    );

    const redirectUrl = pendingOutgoingGrant?.interact?.redirect;
    const continueUri = pendingOutgoingGrant?.continue?.uri;
    const continueAccessToken = pendingOutgoingGrant?.continue?.access_token?.value;

    if (!redirectUrl || !continueUri || !continueAccessToken) {
      throw new Error('No se obtuvo información de interacción del grant.');
    }

    res.json({ ok: true, redirectUrl, continueUri, continueAccessToken });
  } catch (e) {
    console.error('outgoing/start error:', e?.response?.data || e);
    res.status(500).json({ ok:false, error: e?.message || 'start failed' });
  }
});

// ─── 3) Finalizar grant y crear Outgoing Payment ──────────────────────────────
/**
 * POST /op/outgoing/finish
 * body: { incomingPaymentId, continueUri, continueAccessToken, interact_ref }
 * → crea el Outgoing Payment y responde con el objeto resultante.
 */
app.post('/op/outgoing/finish', async (req, res) => {
  try {
    const { senderWallet } = await getWalletDocs();
    const { incomingPaymentId, continueUri, continueAccessToken, interact_ref } = req.body || {};
    if (!incomingPaymentId || !continueUri || !continueAccessToken || !interact_ref) {
      return res.status(400).json({ ok:false, error:'incomingPaymentId, continueUri, continueAccessToken, interact_ref requeridos' });
    }

    const finalized = await senderClient.grant.continue(
      { url: continueUri, accessToken: continueAccessToken },
      { interact_ref }
    );
    if (!isFinalizedGrant(finalized)) throw new Error('Outgoing grant no finalizado');

    const outgoingPayment = await senderClient.outgoingPayment.create(
      { url: senderWallet.resourceServer, accessToken: finalized.access_token.value },
      { walletAddress: senderWallet.id, incomingPayment: incomingPaymentId }
    );

    res.json({ ok:true, outgoingPayment });
  } catch (e) {
    console.error('outgoing/finish error:', e?.response?.data || e);
    res.status(500).json({ ok:false, error: e?.message || 'finish failed' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`OP backend listo en http://localhost:${PORT}`);
  console.log(`→ Health:   http://localhost:${PORT}/health`);
  console.log(`→ Wallets:  http://localhost:${PORT}/op/wallets`);
});
