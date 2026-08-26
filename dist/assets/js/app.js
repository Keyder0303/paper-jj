const SUPABASE_URL = "https://klcibjwleiqppedefpxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2liandsZWlxcHBlZGVmcHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.eE2UYJSX9yKK-1u2sv2aF-G1Rp7yho1Myz1-kSttz6g";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SERVER_URL = "http://localhost:3000"; // URL del wa-server local

function navigate(view, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const viewEl = document.getElementById('app-view');

  if (view === 'dashboard') {
    titleEl.innerText = "Dashboard General";
    viewEl.innerHTML = `
      <div class="grid-4">
        <div class="stat-card"><h4>Clientes Registrados</h4><div class="val" id="stat-cust">...</div></div>
        <div class="stat-card"><h4>Productos en Catálogo</h4><div class="val" id="stat-prod">...</div></div>
        <div class="stat-card"><h4>Órdenes y Pedidos</h4><div class="val" id="stat-ord">...</div></div>
        <div class="stat-card"><h4>Campañas Activas</h4><div class="val" id="stat-camp">0</div></div>
      </div>
      <div class="card">
        <div class="card-title">Estado del Servidor Local (wa-server)</div>
        <div id="server-status-box" style="padding: 12px; background: var(--bg-surface); border-radius: 8px; margin-bottom: 15px;">Verificando conexión con el backend local...</div>
        <button class="btn btn-wa" onclick="checkServerStatus()">Comprobar Conexión con Servidor</button>
      </div>
    `;
    loadStats();
    checkServerStatus();
  } else if (view === 'whatsapp') {
    titleEl.innerText = "Centro de Mensajería WhatsApp & Baileys";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Vinculación por Código QR (WhatsApp Web)</div>
        <p style="color: var(--text-muted); margin-bottom: 15px;">Escanea este código con tu aplicación de WhatsApp para conectar el número de la tienda.</p>
        <button class="btn btn-wa" onclick="fetchWAStatus()">Obtener / Actualizar Código QR</button>
        <div id="wa-status-text" style="margin-top: 10px; font-weight: 500;">Estado: Desconectado</div>
        <div id="qrcode-canvas" style="margin-top: 15px; background: white; padding: 15px; border-radius: 8px; width: fit-content; display: none;"></div>
      </div>
      <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-title">Bandeja de Chats Sincronizados</div>
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; height: 400px;">
          <div style="border-right: 1px solid var(--border); overflow-y: auto;" id="wa-chat-list"><span style="color: var(--text-muted);">Cargando chats...</span></div>
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex: 1; overflow-y: auto; padding: 10px; background: var(--bg-primary); border-radius: 8px;" id="wa-msg-list"><span style="color: var(--text-muted);">Selecciona un chat...</span></div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <input type="text" id="wa-text-input" placeholder="Escribe un mensaje de WhatsApp..." style="margin: 0;">
              <button class="btn btn-wa" onclick="sendWAMessage()">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    fetchWAStatus();
    loadWAChats();
  } else if (view === 'correo') {
    titleEl.innerText = "Centro de Correo Electrónico (Gmail)";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Envío de Correo y Cotizaciones</div>
        <label>Destinatario</label>
        <input type="email" id="mail-to" placeholder="cliente@correo.com">
        <label>Asunto</label>
        <input type="text" id="mail-subj" placeholder="Información comercial">
        <label>Mensaje</label>
        <textarea id="mail-text" rows="5" placeholder="Escribe el mensaje..."></textarea>
        <button class="btn btn-gmail" onclick="sendEmail()">Enviar Correo por Cola</button>
      </div>
    `;
  } else if (view === 'difusion') {
    titleEl.innerText = "Campañas Masivas de Captación";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Nueva Campaña de Difusión</div>
        <label>Título</label>
        <input type="text" id="camp-title" placeholder="Ej. Campaña Lanzamiento">
        <label>Canal</label>
        <select id="camp-chan"><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select>
        <label>Plantilla (Usa {{nombre}})</label>
        <textarea id="camp-body" rows="4" placeholder="Hola {{nombre}}..."></textarea>
        <button class="btn" onclick="saveCampaign()">Crear Campaña</button>
      </div>
    `;
  } else if (view === 'clientes') {
    titleEl.innerText = "CRM de Clientes y Zonas";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Base de Clientes de Paper Puente</div>
        <table>
          <thead><tr><th>Nombre</th><th>RIF / Cédula</th><th>Teléfono</th><th>Zona</th></tr></thead>
          <tbody id="cust-tbody"><tr><td colspan="4">Cargando...</td></tr></tbody>
        </table>
      </div>
    `;
    loadCustomers();
  } else if (view === 'catalogo') {
    titleEl.innerText = "Catálogo e Inventario Independiente";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Productos del Negocio</div>
        <table>
          <thead><tr><th>SKU</th><th>Producto</th><th>Precio (USD)</th><th>Stock</th></tr></thead>
          <tbody id="prod-tbody"><tr><td colspan="4">Cargando...</td></tr></tbody>
        </table>
      </div>
    `;
    loadCatalog();
  } else if (view === 'pedidos') {
    titleEl.innerText = "Control de Pedidos";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Órdenes de Clientes</div>
        <table>
          <thead><tr><th>ID</th><th>Cliente</th><th>Total USD</th><th>Estado</th></tr></thead>
          <tbody id="ord-tbody"><tr><td colspan="4">Cargando...</td></tr></tbody>
        </table>
      </div>
    `;
    loadOrders();
  }
}

async function loadStats() {
  const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
    supabaseClient.from('jjp_customers').select('*', { count: 'exact', head: true }),
    supabaseClient.from('jjp_products').select('*', { count: 'exact', head: true }),
    supabaseClient.from('jjp_orders').select('*', { count: 'exact', head: true })
  ]);
  document.getElementById('stat-cust').innerText = c1 || 0;
  document.getElementById('stat-prod').innerText = c2 || 0;
  document.getElementById('stat-ord').innerText = c3 || 0;
}

async function checkServerStatus() {
  const box = document.getElementById('server-status-box');
  try {
    const res = await fetch(`${SERVER_URL}/health`);
    const json = await res.json();
    box.innerHTML = `<span style="color: var(--success);">🟢 Servidor Local Conectado (Puerto 3000) — Estado: ${json.status}</span>`;
  } catch(e) {
    box.innerHTML = `<span style="color: var(--gmail);">🔴 Servidor Local Desconectado. Asegúrate de ejecutar <code>npm start</code> en la carpeta <code>wa-server</code>.</span>`;
  }
}

let activePhone = null;

async function fetchWAStatus() {
  const statusText = document.getElementById('wa-status-text');
  const qrBox = document.getElementById('qrcode-canvas');
  try {
    const res = await fetch(`${SERVER_URL}/api/wa/status`);
    const data = await res.json();
    statusText.innerText = `Estado de Sesión: ${data.status}`;
    if (data.status === 'qr_ready' && data.qr) {
      qrBox.style.display = 'block';
      qrBox.innerHTML = '';
      QRCode.toCanvas(qrBox, data.qr, { width: 220 }, function (error) {
        if (error) console.error(error);
      });
    } else if (data.status === 'connected') {
      qrBox.style.display = 'none';
      statusText.innerHTML = `<span style="color: var(--success);">🟢 WhatsApp Conectado Exitosamente</span>`;
    }
  } catch(e) {
    statusText.innerHTML = `<span style="color: var(--gmail);">❌ Error conectando con el backend local (wa-server apagado).</span>`;
  }
}

async function loadWAChats() {
  const list = document.getElementById('wa-chat-list');
  const { data } = await supabaseClient.from('jjp_wa_messages').select('*').order('created_at', { ascending: false }).limit(30);
  if (!data || data.length === 0) { list.innerHTML = `<span style="color: var(--text-muted);">Sin chats en cola.</span>`; return; }
  const phones = [...new Set(data.map(m => m.phone))];
  list.innerHTML = phones.map(p => `
    <div style="padding: 10px; background: var(--bg-surface); border-radius: 6px; margin-bottom: 6px; cursor: pointer;" onclick="selectChat('${p}')">
      <strong>${p}</strong>
    </div>
  `).join('');
}

async function selectChat(phone) {
  activePhone = phone;
  const msgList = document.getElementById('wa-msg-list');
  msgList.innerHTML = `<span style="color: var(--text-muted);">Cargando mensajes con ${phone}...</span>`;
  const { data } = await supabaseClient.from('jjp_wa_messages').select('*').eq('phone', phone).order('created_at', { ascending: true });
  if (!data || data.length === 0) { msgList.innerHTML = `<span>Sin historial.</span>`; return; }
  msgList.innerHTML = data.map(m => `
    <div style="margin-bottom: 8px; text-align: ${m.direction === 'outbound' ? 'right' : 'left'};">
      <div style="display: inline-block; padding: 8px 12px; border-radius: 8px; background: ${m.direction === 'outbound' ? 'var(--accent)' : 'var(--bg-card)'}; color: #fff; font-size: 0.9rem;">
        ${m.message}
      </div>
    </div>
  `).join('');
}

async function sendWAMessage() {
  const text = document.getElementById('wa-text-input').value;
  if (!text || !activePhone) { alert('Selecciona un chat y escribe un mensaje'); return; }
  try {
    const res = await fetch(`${SERVER_URL}/api/wa/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: activePhone, message: text })
    });
    const json = await res.json();
    if (json.success) {
      document.getElementById('wa-text-input').value = '';
      selectChat(activePhone);
    } else {
      alert('Error enviando: ' + json.error);
    }
  } catch(e) {
    alert('Error conectando con el servidor local para enviar.');
  }
}

async function loadCustomers() {
  const { data } = await supabaseClient.from('jjp_customers').select('*').limit(50);
  const tbody = document.getElementById('cust-tbody');
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">Sin clientes.</td></tr>`; return; }
  tbody.innerHTML = data.map(c => `<tr><td>${c.name}</td><td>${c.rif || 'N/A'}</td><td>${c.phone || 'N/A'}</td><td>${c.zone || 'General'}</td></tr>`).join('');
}

async function loadCatalog() {
  const { data } = await supabaseClient.from('jjp_products').select('*').limit(50);
  const tbody = document.getElementById('prod-tbody');
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">Sin productos.</td></tr>`; return; }
  tbody.innerHTML = data.map(p => `<tr><td>${p.sku || 'N/A'}</td><td>${p.name}</td><td>$${p.price_usd || 0}</td><td>${p.stock || 0}</td></tr>`).join('');
}

async function loadOrders() {
  const { data } = await supabaseClient.from('jjp_orders').select('*').limit(50);
  const tbody = document.getElementById('ord-tbody');
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">Sin pedidos.</td></tr>`; return; }
  tbody.innerHTML = data.map(o => `<tr><td>#${o.id}</td><td>${o.customer_name || 'Cliente'}</td><td>$${o.total_usd || 0}</td><td>${o.status || 'Nuevo'}</td></tr>`).join('');
}

function sendEmail() { alert('Correo programado en la cola.'); }
function saveCampaign() { alert('Campaña guardada.'); }

window.onload = () => navigate('dashboard');
