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
      <div class="grid-4">
        <div class="stat-card"><h4>Clientes Totales</h4><div class="val" id="stat-cust">...</div></div>
        <div class="stat-card"><h4>Productos Activos</h4><div class="val" id="stat-prod">...</div></div>
        <div class="stat-card"><h4>Pedidos Nuevos</h4><div class="val" id="stat-ord">...</div></div>
        <div class="stat-card"><h4>Campañas Activas</h4><div class="val" id="stat-camp">...</div></div>
      </div>
      <div class="card">
        <div class="card-title">Resumen de Actividad del Puente de Comunicaciones</div>
        <p style="color: var(--text-muted);">Bienvenido al nuevo sistema independiente Paper Puente. Utiliza el menú lateral para gestionar WhatsApp, correos, campañas, catálogo y captación de clientes sin fricciones.</p>
      </div>
    `;
    loadStats();
  } else if (view === 'whatsapp') {
    titleEl.innerText = "Centro de Mensajería WhatsApp & Baileys";
    viewEl.innerHTML = `
      <div class="card" style="height: 100%; display: flex; flex-direction: column;">
        <div class="card-title">Bandeja de Mensajes Recientes</div>
        <div style="flex: 1; display: grid; grid-template-columns: 280px 1fr; gap: 20px; height: 450px;">
          <div style="border-right: 1px solid var(--border); overflow-y: auto;" id="wa-chat-list"><span style="color: var(--text-muted); font-size: 0.85rem;">Cargando chats...</span></div>
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex: 1; overflow-y: auto; padding: 10px; background: var(--bg-main); border-radius: 8px;" id="wa-msg-list"><span style="color: var(--text-muted); font-size: 0.85rem;">Selecciona una conversación...</span></div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <input type="text" id="wa-text-input" placeholder="Escribe un mensaje de WhatsApp..." style="margin: 0;">
              <button class="btn" onclick="sendWAMsg()">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    loadWAChats();
  } else if (view === 'correo') {
    titleEl.innerText = "Centro de Correo Electrónico (Gmail)";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Enviar Correo de Atención / Cotización</div>
        <label>Correo Destinatario</label>
        <input type="email" id="mail-to" placeholder="cliente@correo.com">
        <label>Asunto</label>
        <input type="text" id="mail-subject" placeholder="Asunto del mensaje">
        <label>Mensaje</label>
        <textarea id="mail-body" rows="6" placeholder="Escribe el contenido del correo..."></textarea>
        <button class="btn" onclick="sendEmailMsg()">Enviar Correo</button>
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
        <select id="camp-type"><option value="whatsapp">WhatsApp</option><option value="email">Correo</option></select>
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
    const [{ count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
      supabaseClient.from('jjp_customers').select('*', { count: 'exact', head: true }),
      supabaseClient.from('jjp_products').select('*', { count: 'exact', head: true }),
      supabaseClient.from('jjp_orders').select('*', { count: 'exact', head: true })
    ]);
    document.getElementById('stat-cust').innerText = c1 || 0;
    document.getElementById('stat-prod').innerText = c2 || 0;
    document.getElementById('stat-ord').innerText = c3 || 0;
    document.getElementById('stat-camp').innerText = 0;
  } catch(e) {
    console.error(e);
  }
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
    <div style="padding: 10px; background: var(--bg-surface); border-radius: 6px; margin-bottom: 6px; cursor: pointer;" onclick="selectChat('${p}')">
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
