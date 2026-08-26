const SUPABASE_URL = "https://klcibjwleiqppedefpxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2liandsZWlxcHBlZGVmcHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.eE2UYJSX9yKK-1u2sv2aF-G1Rp7yho1Myz1-kSttz6g";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  const content = document.getElementById('main-content');
  if (tab === 'dashboard') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Resumen Operativo de Paper Puente</div></div>
        <p style="color: var(--text-muted);">Sistema centralizado para la gestión interna de comunicaciones, campañas automatizadas, inventario y captación de clientes.</p>
      </div>
    `;
  } else if (tab === 'chat') {
    content.innerHTML = `
      <div class="card" style="height: 100%; display: flex; flex-direction: column;">
        <div class="card-header"><div class="card-title">Centro de Comunicaciones WhatsApp (Baileys)</div></div>
        <div style="flex: 1; display: flex; gap: 20px; height: 500px;">
          <div style="width: 300px; border-right: 1px solid var(--border); overflow-y: auto;" id="chat-list">Cargando chats...</div>
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;" id="chat-box">
            <div style="flex: 1; overflow-y: auto; padding: 10px;" id="message-list">Selecciona un chat para comenzar la conversación.</div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <input type="text" id="msg-input" placeholder="Escribe un mensaje de WhatsApp...">
              <button class="btn" onclick="sendWhatsApp()">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    loadChats();
  } else if (tab === 'campaigns') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Módulo de Difusión y Campañas Masivas</div></div>
        <div class="grid-2">
          <div>
            <label>Título de la Campaña</label>
            <input type="text" id="camp-title" placeholder="Ej. Promoción de Papelería al Mayor">
            <label style="margin-top: 10px; display: block;">Mensaje / Plantilla</label>
            <textarea id="camp-msg" rows="5" placeholder="Hola {{nombre}}, descubre nuestras nuevas tarifas..."></textarea>
            <button class="btn" style="margin-top: 15px;" onclick="createCampaign()">Crear y Lanzar Campaña</button>
          </div>
          <div>
            <h3>Campañas Activas / Historial</h3>
            <div id="campaign-list" style="margin-top: 10px;">Cargando...</div>
          </div>
        </div>
      </div>
    `;
    loadCampaigns();
  } else if (tab === 'catalog') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Catálogo e Inventario Interno</div><button class="btn" onclick="loadCatalog()">Actualizar</button></div>
        <div style="overflow-x: auto;">
          <table>
            <thead><tr><th>SKU</th><th>Producto</th><th>Precio (USD)</th><th>Stock</th></tr></thead>
            <tbody id="catalog-table"><tr><td colspan="4">Cargando catálogo...</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    loadCatalog();
  } else if (tab === 'customers') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Cartera de Clientes y Zonas</div></div>
        <div style="overflow-x: auto;">
          <table>
            <thead><tr><th>Nombre / Empresa</th><th>RIF / Cédula</th><th>Teléfono</th><th>Zona</th></tr></thead>
            <tbody id="customer-table"><tr><td colspan="4">Cargando clientes...</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    loadCustomers();
  } else if (tab === 'orders') {
    content.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Control de Pedidos y Cotizaciones</div></div>
        <div style="overflow-x: auto;">
          <table>
            <thead><tr><th>ID Pedido</th><th>Cliente</th><th>Total (USD)</th><th>Estado</th></tr></thead>
            <tbody id="order-table"><tr><td colspan="4">Cargando pedidos...</td></tr></tbody>
          </table>
        </div>
      </div>
    `;
    loadOrders();
  }
}

async function loadCatalog() {
  const { data, error } = await supabaseClient.from('jjp_products').select('*').limit(50);
  const tbody = document.getElementById('catalog-table');
  if (error) { tbody.innerHTML = `<tr><td colspan="4">Error cargando inventario: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">No hay productos registrados.</td></tr>`; return; }
  tbody.innerHTML = data.map(p => `
    <tr>
      <td>${p.sku || 'N/A'}</td>
      <td>${p.name}</td>
      <td>$${p.price_usd || 0}</td>
      <td>${p.stock || 0}</td>
    </tr>
  `).join('');
}

async function loadCustomers() {
  const { data, error } = await supabaseClient.from('jjp_customers').select('*').limit(50);
  const tbody = document.getElementById('customer-table');
  if (error) { tbody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">No hay clientes registrados.</td></tr>`; return; }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.rif || 'N/A'}</td>
      <td>${c.phone || 'N/A'}</td>
      <td><span class="badge badge-success">${c.zone || 'General'}</span></td>
    </tr>
  `).join('');
}

async function loadOrders() {
  const { data, error } = await supabaseClient.from('jjp_orders').select('*').limit(50);
  const tbody = document.getElementById('order-table');
  if (error) { tbody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">No hay pedidos registrados.</td></tr>`; return; }
  tbody.innerHTML = data.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.customer_name || 'Cliente'}</td>
      <td>$${o.total_usd || 0}</td>
      <td><span class="badge badge-success">${o.status || 'Nuevo'}</span></td>
    </tr>
  `).join('');
}

async function loadChats() {
  const list = document.getElementById('chat-list');
  list.innerHTML = `<div style="padding: 10px; color: var(--text-muted);">Sincronizando chats con wa-server...</div>`;
  // Conexión con tabla de mensajes o wa-server
  const { data, error } = await supabaseClient.from('jjp_wa_messages').select('*').order('created_at', { ascending: false }).limit(20);
  if (error || !data) {
    list.innerHTML = `<div style="padding: 10px; color: var(--text-muted);">Sin mensajes recientes en cola.</div>`;
    return;
  }
  const uniquePhones = [...new Set(data.map(m => m.phone))];
  list.innerHTML = uniquePhones.map(phone => `
    <div style="padding: 12px; border-bottom: 1px solid var(--border); cursor: pointer;" onclick="selectChat('${phone}')">
      <strong>${phone}</strong>
      <div style="font-size: 0.8rem; color: var(--text-muted);">Último mensaje sincronizado</div>
    </div>
  `).join('');
}

function selectChat(phone) {
  document.getElementById('message-list').innerHTML = `<div style="padding: 10px;">Cargando mensajes para ${phone} ...</div>`;
}

async function loadCampaigns() {
  const list = document.getElementById('campaign-list');
  const { data, error } = await supabaseClient.from('jjp_wa_campaigns').select('*').order('created_at', { ascending: false });
  if (error || !data || data.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted);">No hay campañas creadas aún.</p>`;
    return;
  }
  list.innerHTML = data.map(c => `
    <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; margin-bottom: 8px;">
      <strong>${c.title}</strong> — <span class="badge badge-success">${c.status || 'Activa'}</span>
    </div>
  `).join('');
}

async function createCampaign() {
  const title = document.getElementById('camp-title').value;
  const message = document.getElementById('camp-msg').value;
  if (!title || !message) { alert('Completa todos los campos'); return; }
  const { error } = await supabaseClient.from('jjp_wa_campaigns').insert([{ title, message, status: 'pending' }]);
  if (error) { alert('Error al crear campaña: ' + error.message); }
  else { alert('Campaña creada exitosamente'); loadCampaigns(); }
}

// Cargar dashboard por defecto al abrir
window.onload = () => switchTab('dashboard');
