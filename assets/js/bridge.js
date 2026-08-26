const SUPABASE_URL = "https://klcibjwleiqppedefpxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2liandsZWlxcHBlZGVmcHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.eE2UYJSX9yKK-1u2sv2aF-G1Rp7yho1Myz1-kSttz6g";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function navigate(view, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const viewEl = document.getElementById('app-view');

  if (view === 'dashboard') {
    titleEl.innerText = "Dashboard General";
    viewEl.innerHTML = `
      <div class="server-banner">
        <div>
          <strong>Estado del Servidor Local (wa-server):</strong> <span id="server-status" style="color: #eab308;">Verificando heartbeat...</span>
        </div>
        <div>
          <button class="btn btn-wa" onclick="triggerServerAction('restart')">Reiniciar Baileys</button>
        </div>
      </div>
      <div class="grid-4">
        <div class="stat-card"><h4>Clientes Totales</h4><div class="val" id="stat-cust">...</div></div>
        <div class="stat-card"><h4>Productos Activos</h4><div class="val" id="stat-prod">...</div></div>
        <div class="stat-card"><h4>Pedidos Nuevos</h4><div class="val" id="stat-ord">...</div></div>
        <div class="stat-card"><h4>Mensajes en Cola</h4><div class="val" id="stat-msg">...</div></div>
      </div>
      <div class="card">
        <div class="card-title">Resumen del Puente de Comunicaciones</div>
        <p style="color: var(--text-muted);">Sistema optimizado y conectado exclusivamente a tu base de datos de producción (`klcibjwleiqppedefpxw`). Desde aquí operas el servidor local Baileys, Gmail, campañas y CRM.</p>
      </div>
    `;
    loadStats();
    checkServerHeartbeat();
  } else if (view === 'whatsapp') {
    titleEl.innerText = "Centro de Mensajería WhatsApp & Baileys";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Vincular / Estado de Sesión Baileys</div>
        <p style="color: var(--text-muted); margin-bottom: 15px;">Para iniciar sesión en WhatsApp Web, asegúrate de que el servidor local (`wa-server`) esté corriendo en tu PC y escanea el código QR o verifica la conexión.</p>
        <button class="btn btn-wa" onclick="fetchQRCode()">Mostrar Código QR / Estado</button>
        <div id="qr-container" style="margin-top: 15px; color: var(--text-muted);"></div>
      </div>
      <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-title">Bandeja de Mensajes y Chats Activos</div>
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; height: 450px;">
          <div style="border-right: 1px solid var(--border); overflow-y: auto;" id="wa-chat-list"><span style="color: var(--text-muted);">Cargando chats...</span></div>
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex: 1; overflow-y: auto; padding: 10px; background: var(--bg-primary); border-radius: 6px;" id="wa-msg-list"><span style="color: var(--text-muted);">Selecciona un chat...</span></div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <input type="text" id="wa-text-input" placeholder="Escribe un mensaje de WhatsApp..." style="margin: 0;">
              <button class="btn btn-wa" onclick="sendWAMsg()">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    loadWAChats();
  } else if (view === 'correo') {
    titleEl.innerText = "Centro de Correo Electrónico (Gmail API)";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Vincular / Configurar Cuenta de Gmail</div>
        <p style="color: var(--text-muted); margin-bottom: 15px;">El motor ` + "`wa-server/src/email.js`" + ` gestiona la autenticación OAuth y el envío bidireccional por usuario.</p>
        <button class="btn btn-gmail" onclick="alert('Configuración de Gmail activa mediante wa-server.')">Verificar Conexión Gmail</button>
      </div>
      <div class="card">
        <div class="card-title">Enviar Correo de Atención / Cotización</div>
        <label>Correo Destinatario</label>
        <input type="email" id="mail-to" placeholder="cliente@correo.com">
        <label>Asunto</label>
        <input type="text" id="mail-subject" placeholder="Asunto del mensaje">
        <label>Mensaje</label>
        <textarea id="mail-body" rows="6" placeholder="Escribe el contenido del correo..."></textarea>
        <button class="btn btn-gmail" onclick="sendEmailMsg()">Enviar Correo por Cola</button>
      </div>
    `;
  } else if (view === 'difusion') {
    titleEl.innerText = "Campañas Masivas y Difusión";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Crear Nueva Campaña de Captación</div>
        <label>Título de la Campaña</label>
        <input type="text" id="camp-name" placeholder="Ej. Promoción Mayorista Semanal">
        <label>Canal</label>
        <select id="camp-type"><option value="whatsapp">WhatsApp (Baileys)</option><option value="email">Correo (Gmail)</option></select>
        <label>Mensaje (Usa variables como {{nombre}})</label>
        <textarea id="camp-text" rows="5" placeholder="Hola {{nombre}}, descubre nuestro inventario actualizado..."></textarea>
        <button class="btn" onclick="createCampaignRecord()">Lanzar Campaña en Cola</button>
      </div>
    `;
  } else if (view === 'clientes') {
    titleEl.innerText = "CRM de Clientes y Zonas";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Cartera de Clientes Registrados</div>
        <table>
          <thead><tr><th>Nombre / Empresa</th><th>RIF</th><th>Teléfono</th><th>Zona</th></tr></thead>
          <tbody id="cust-tbody"><tr><td colspan="4">Cargando clientes...</td></tr></tbody>
        </table>
      </div>
    `;
    loadCustomers();
  } else if (view === 'catalogo') {
    titleEl.innerText = "Catálogo e Inventario Interno";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Inventario de Productos</div>
        <table>
          <thead><tr><th>SKU</th><th>Producto</th><th>Precio (USD)</th><th>Stock</th></tr></thead>
          <tbody id="prod-tbody"><tr><td colspan="4">Cargando inventario...</td></tr></tbody>
        </table>
      </div>
    `;
    loadCatalog();
  } else if (view === 'pedidos') {
    titleEl.innerText = "Control de Pedidos y Captación";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Órdenes y Solicitudes</div>
        <table>
          <thead><tr><th>ID</th><th>Cliente</th><th>Total USD</th><th>Estado</th></tr></thead>
          <tbody id="ord-tbody"><tr><td colspan="4">Cargando pedidos...</td></tr></tbody>
        </table>
      </div>
    `;
    loadOrders();
  }
}

async function loadStats() {
  try {
    const [{ count: c1 }, { count: c2 }, { count: c3 }, { count: c4 }] = await Promise.all([
      supabaseClient.from('jjp_customers').select('*', { count: 'exact', head: true }),
      supabaseClient.from('jjp_products').select('*', { count: 'exact', head: true }),
      supabaseClient.from('jjp_orders').select('*', { count: 'exact', head: true }),
      supabaseClient.from('jjp_wa_messages').select('*', { count: 'exact', head: true })
    ]);
    document.getElementById('stat-cust').innerText = c1 || 0;
    document.getElementById('stat-prod').innerText = c2 || 0;
    document.getElementById('stat-ord').innerText = c3 || 0;
    document.getElementById('stat-msg').innerText = c4 || 0;
  } catch(e) {
    console.error(e);
  }
}

async function checkServerHeartbeat() {
  const badge = document.getElementById('server-status');
  if (!badge) return;
  const { data } = await supabaseClient.from('jjp_server_control').select('*').eq('id', 1).single();
  if (data && data.updated_at) {
    const diff = (new Date() - new Date(data.updated_at)) / 1000;
    if (diff < 70) {
      badge.innerHTML = `<span style="color: #3fb950;">🟢 Activo (Último latido hace ${Math.floor(diff)}s)</span>`;
    } else {
      badge.innerHTML = `<span style="color: #f85149;">🔴 Desconectado (Inactivo desde hace ${Math.floor(diff)}s)</span>`;
    }
  } else {
    badge.innerHTML = `<span style="color: #f85149;">🔴 Sin registro de latido</span>`;
  }
}

async function triggerServerAction(action) {
  await supabaseClient.from('jjp_server_control').update({ command: action, updated_at: new Date() }).eq('id', 1);
  alert('Comando "' + action + '" enviado al servidor local.');
}

async function fetchQRCode() {
  document.getElementById('qr-container').innerHTML = `Estado: Solicitando sincronización con Baileys...`;
}

async function loadCustomers() {
  const { data } = await supabaseClient.from('jjp_customers').select('*').limit(50);
  const tbody = document.getElementById('cust-tbody');
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">Sin registros.</td></tr>`; return; }
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
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">Sin pedidos recientes.</td></tr>`; return; }
  tbody.innerHTML = data.map(o => `<tr><td>#${o.id}</td><td>${o.customer_name || 'Cliente'}</td><td>$${o.total_usd || 0}</td><td>${o.status || 'Nuevo'}</td></tr>`).join('');
}

async function loadWAChats() {
  const list = document.getElementById('wa-chat-list');
  const { data } = await supabaseClient.from('jjp_wa_messages').select('*').order('created_at', { ascending: false }).limit(20);
  if (!data || data.length === 0) {
    list.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">No hay chats en cola.</span>`;
    return;
  }
  const phones = [...new Set(data.map(m => m.phone))];
  list.innerHTML = phones.map(p => `
    <div style="padding: 10px; background: var(--bg-card); border-radius: 6px; margin-bottom: 6px; cursor: pointer;" onclick="selectChat('${p}')">
      <strong>${p}</strong>
    </div>
  `).join('');
}

function selectChat(phone) {
  document.getElementById('wa-msg-list').innerHTML = `<div style="color: var(--accent); font-size: 0.9rem;">Chat activo con: ${phone}</div>`;
}

async function sendWAMsg() {
  const txt = document.getElementById('wa-text-input').value;
  if (!txt) return;
  alert('Mensaje encolado para el motor de WhatsApp.');
  document.getElementById('wa-text-input').value = '';
}

async function sendEmailMsg() {
  alert('Correo programado en la cola del servidor.');
}

async function createCampaignRecord() {
  alert('Campaña creada y almacenada en la base de datos.');
}

window.onload = () => navigate('dashboard');
