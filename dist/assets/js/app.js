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
        <div class="stat-card"><h4>Clientes Registrados</h4><div class="val" id="stat-cust">...</div></div>
        <div class="stat-card"><h4>Productos en Catálogo</h4><div class="val" id="stat-prod">...</div></div>
        <div class="stat-card"><h4>Órdenes y Pedidos</h4><div class="val" id="stat-ord">...</div></div>
        <div class="stat-card"><h4>Campañas Activas</h4><div class="val" id="stat-camp">0</div></div>
      </div>
      <div class="card">
        <div class="card-title">Bienvenido a Paper Puente</div>
        <p style="color: var(--text-muted);">Sistema independiente de comunicaciones para tu nuevo negocio. Gestiona tu propio catálogo, clientes de captación, mensajería de WhatsApp con Baileys y campañas de correo sin depender de JJ Paper.</p>
      </div>
    `;
    loadStats();
  } else if (view === 'whatsapp') {
    titleEl.innerText = "Centro de Mensajería WhatsApp & Baileys";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Conexión de WhatsApp Web (Baileys)</div>
        <p style="color: var(--text-muted); margin-bottom: 15px;">Inicia el servidor local en ` + "`wa-server/`" + ` para gestionar la sesión de WhatsApp de este proyecto.</p>
        <button class="btn btn-wa" onclick="alert('Servidor Baileys listo para iniciar localmente.')">Ver Estado de Sesión</button>
      </div>
      <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-title">Bandeja de Chats Activos</div>
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; height: 400px;">
          <div style="border-right: 1px solid var(--border); overflow-y: auto;" id="wa-chats"><span style="color: var(--text-muted);">Cargando chats...</span></div>
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex: 1; overflow-y: auto; padding: 10px; background: var(--bg-primary); border-radius: 8px;" id="wa-msgs"><span style="color: var(--text-muted);">Selecciona un chat...</span></div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <input type="text" id="wa-input" placeholder="Escribe tu mensaje..." style="margin: 0;">
              <button class="btn btn-wa" onclick="sendWA()">Enviar</button>
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
        <div class="card-title">Envío de Correo y Cotizaciones</div>
        <label>Destinatario</label>
        <input type="email" id="mail-to" placeholder="cliente@correo.com">
        <label>Asunto</label>
        <input type="text" id="mail-subj" placeholder="Información comercial">
        <label>Mensaje</label>
        <textarea id="mail-text" rows="5" placeholder="Escribe el mensaje..."></textarea>
        <button class="btn btn-gmail" onclick="sendMail()">Enviar Correo</button>
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

async function loadWAChats() {
  const list = document.getElementById('wa-chats');
  const { data } = await supabaseClient.from('jjp_wa_messages').select('*').order('created_at', { ascending: false }).limit(20);
  if (!data || data.length === 0) { list.innerHTML = `<span style="color: var(--text-muted);">Sin chats.</span>`; return; }
  const phones = [...new Set(data.map(m => m.phone))];
  list.innerHTML = phones.map(p => `<div style="padding: 10px; background: var(--bg-surface); border-radius: 6px; margin-bottom: 6px;"><strong>${p}</strong></div>`).join('');
}

function sendWA() { alert('Mensaje encolado.'); }
function sendMail() { alert('Correo encolado.'); }
function saveCampaign() { alert('Campaña guardada.'); }

window.onload = () => navigate('dashboard');
