const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalStore, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

// Leer .env manual y robusto
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const app = express();
app.use(express.json());
const server = http.createServer(app);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://klcibjwleiqppedefpxw.supabase.co';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2liandsZWlxcHBlZGVmcHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.eE2UYJSX9yKK-1u2sv2aF-G1Rp7yho1Myz1-kSttz6g';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

let sock = null;
let latestQR = null;
let connectionStatus = 'disconnected';

async function startWhatsApp() {
  const authFolder = path.join(__dirname, 'sessions');
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalStore(state.keys, pino({ level: 'silent' }))
    },
    printQRInTerminal: true,
    browser: ['Paper Puente', 'Chrome', '10.0']
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      latestQR = qr;
      connectionStatus = 'qr_ready';
      console.log('📱 QR Code generado para WhatsApp Web:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      connectionStatus = 'disconnected';
      console.log('⚠️ Conexión de WhatsApp cerrada. Reconectando:', shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startWhatsApp, 5000);
      }
    } else if (connection === 'open') {
      connectionStatus = 'connected';
      latestQR = null;
      console.log('✅ Baileys WhatsApp conectado exitosamente.');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      const remoteJid = msg.key.remoteJid;
      const phone = remoteJid.split('@')[0];
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      
      if (text) {
        console.log(`📩 Mensaje entrante [${phone}]: ${text}`);
        await supabase.from('jjp_wa_messages').insert([{
          phone: phone,
          message: text,
          direction: 'inbound',
          status: 'received',
          created_at: new Date()
        }]).catch(err => console.error('DB Insert Error:', err.message));
      }
    }
  });
}

// API Endpoints
app.get('/health', (req, res) => {
  res.json({ status: connectionStatus, service: 'paper-puente-server', timestamp: new Date() });
});

app.get('/api/wa/status', (req, res) => {
  res.json({ status: connectionStatus, qr: latestQR });
});

app.post('/api/wa/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'Faltan parámetros phone o message' });

  try {
    const jjid = phone.includes('@s.whatsapp.net') ? phone : `${phone}@s.whatsapp.net`;
    if (!sock) throw new Error('Socket de WhatsApp no inicializado');
    
    await sock.sendMessage(jjid, { text: message });
    
    await supabase.from('jjp_wa_messages').insert([{
      phone: phone,
      message: message,
      direction: 'outbound',
      status: 'sent',
      created_at: new Date()
    }]);

    res.json({ success: true, status: 'sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Heartbeat automático
setInterval(async () => {
  try {
    await supabase.from('jjp_server_control').upsert({ id: 1, status: connectionStatus, updated_at: new Date() });
  } catch(e) {}
}, 20000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Paper Puente escuchando en el puerto ${PORT}`);
  startWhatsApp();
});
