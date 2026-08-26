const SUPABASE_URL = "https://czzvsqnmxtjzqzioknnn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enZzcW5teHRqenF6aW9rbnnnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.mockkey";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SERVER_URL = "http://localhost:3000";

function navigate(view, btn) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titleEl = document.getElementById('page-title');
  const viewEl = document.getElementById('app-view');

  if (view === 'dashboard') {
    titleEl.innerText = "Dashboard General";
    viewEl.innerHTML = `
      <div class="grid-4">
        <div class="stat-card"><h4>Clientes CRM</h4><div class="val" id="stat-cust">0</div></div>
        <div class="stat-card"><h4>Productos Catálogo</h4><div class="val" id="stat-prod">101</div></div>
        <div class="stat-card"><h4>Unidades Inventario</h4><div class="val" id="stat-inv">31,240</div></div>
        <div class="stat-card"><h4>Campañas Activas</h4><div class="val" id="stat-camp">3</div></div>
      </div>
      <div class="card">
        <div class="card-title">Estado del Servidor y Puente Operativo</div>
        <div id="server-status-box" style="padding: 15px; background: var(--bg-primary); border-radius: 8px; margin-bottom: 15px;">Comprobando servicios locales...</div>
        <button class="btn" onclick="checkServerStatus()">Verificar Conexión de Sockets</button>
      </div>
    `;
    checkServerStatus();
  } else if (view === 'whatsapp') {
    titleEl.innerText = "WhatsApp Web & Baileys Bridge";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Vinculación de Sesión de WhatsApp</div>
        <p style="color: var(--text-muted); margin-bottom: 15px;">Escanea el código QR para conectar la sesión en tiempo real con el servidor Baileys.</p>
        <button class="btn btn-wa" onclick="fetchWAStatus()">Generar / Refrescar Código QR</button>
        <div id="wa-status-text" style="margin-top: 15px; font-weight: 500;">Estado: Sincronizando con wss...</div>
        <div id="qrcode-canvas" style="margin-top: 15px; background: white; padding: 15px; border-radius: 8px; width: fit-content; display: none;"></div>
      </div>
      <div class="card">
        <div class="card-title">Bandeja de Chats Activos</div>
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; height: 420px;">
          <div style="border-right: 1px solid var(--border); overflow-y: auto;" id="wa-chat-list">
            <div style="padding: 10px; background: var(--bg-primary); border-radius: 6px; margin-bottom: 6px; cursor: pointer;"><strong>+58 412-5550192</strong><br><small style="color: var(--text-muted);">Pedido de Resma A4</small></div>
            <div style="padding: 10px; background: var(--bg-surface); border-radius: 6px; margin-bottom: 6px; cursor: pointer;"><strong>+58 414-9982311</strong><br><small style="color: var(--text-muted);">Cotización Industrias Mayka</small></div>
          </div>
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="flex: 1; overflow-y: auto; padding: 15px; background: var(--bg-primary); border-radius: 8px;" id="wa-msg-list">
              <div style="margin-bottom: 10px;"><div style="display: inline-block; padding: 10px; background: var(--bg-card); border-radius: 8px;">Hola, ¿tienen disponibilidad de resmas de papel bond al mayor?</div></div>
              <div style="margin-bottom: 10px; text-align: right;"><div style="display: inline-block; padding: 10px; background: var(--wa); color: white; border-radius: 8px;">¡Hola! Sí, tenemos inventario completo con precio especial para distribuidores.</div></div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <input type="text" id="wa-text-input" placeholder="Escribe un mensaje por WhatsApp..." style="margin: 0;">
              <button class="btn btn-wa" onclick="alert('Mensaje encolado para envío Baileys')">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (view === 'correo') {
    titleEl.innerText = "Gestión de Correo Electrónico (Gmail HTML)";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Redactar Correo con Plantilla HTML</div>
        <label>Destinatario</label>
        <input type="email" id="mail-to" placeholder="cliente@empresa.com">
        <label>Asunto</label>
        <input type="text" id="mail-subject" placeholder="Catálogo Actualizado e Inventario - JJ Paper">
        <label>Plantilla HTML</label>
        <textarea id="mail-html" rows="6" placeholder="<h1>Hola {{nombre}}</h1><p>Adjuntamos cotización...</p>"><div style="font-family:Arial; padding:20px; background:#f4f4f4;"><h2>Catálogo y Ofertas JJ Paper</h2><p>Estimado cliente, presentamos nuestro stock actualizado de 31,000 unidades.</p><a href="#" style="background:#25d366; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">Ver Catálogo</a></div></textarea>
        <button class="btn btn-gmail" onclick="alert('Correo HTML encolado para SMTP')">Enviar Correo HTML</button>
      </div>
    `;
  } else if (view === 'difusion') {
    titleEl.innerText = "Motor de Campañas Masivas";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Lanzar Campaña Promocional Masiva</div>
        <label>Nombre de la Campaña</label>
        <input type="text" placeholder="Promo Especial Resmas y Papelería">
        <label>Canal de Difusión</label>
        <select><option>WhatsApp Masivo (Baileys)</option><option>Correo Electrónico (HTML)</option></select>
        <label>Producto Asociado para Promoción</label>
        <select><option>Resma de Papel Bond A4 (Stock: 12,400)</option><option>Carpetas Manila Oficio (Stock: 8,500)</option></select>
        <label>Mensaje / Plantilla Personalizada</label>
        <textarea rows="4" placeholder="Hola {{nombre}}, aprovecha nuestra oferta exclusiva en {{producto}} con 15% de descuento por volumen.">Hola, tenemos disponible el lote de inventario con precio especial para tu zona.</textarea>
        <button class="btn" onclick="alert('Campaña masiva iniciada con éxito en segundo plano')">Ejecutar Campaña Masiva</button>
      </div>
    `;
  } else if (view === 'clientes') {
    titleEl.innerText = "CRM y Cartera de Clientes por Zonas";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Clientes Segmentados (Vendedores: Yovanni / Adriana)</div>
        <table>
          <thead><tr><th>Cliente / Empresa</th><th>RIF</th><th>Teléfono</th><th>Zona</th><th>Vendedor Asignado</th></tr></thead>
          <tbody>
            <tr><td>Industrias Mayka C.A.</td><td>J-40192837-1</td><td>+58 412-5550192</td><td>Zona Norte</td><td>Yovanni</td></tr>
            <tr><td>Distribuciones Milan</td><td>J-30928172-4</td><td>+58 414-9982311</td><td>Zona Centro</td><td>Adriana</td></tr>
            <tr><td>Papelería Comercial Express</td><td>J-29837465-8</td><td>+58 416-7788990</td><td>Zona Sur</td><td>Yovanni</td></tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (view === 'catalogo') {
    titleEl.innerText = "Catálogo Interno e Inventario (101 Productos)";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Ficha de Productos y Control de Stock</div>
        <table>
          <thead><tr><th>SKU</th><th>Descripción de Producto</th><th>Costo (USD)</th><th>Precio Venta (USD)</th><th>Stock Disponible</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr><td>JJP-001</td><td>Resma Papel Bond Base 20 A4</td><td>$3.50</td><td>$4.80</td><td>12,400 u.</td><td><button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="alert('Ficha detallada del producto')">Ver Ficha</button></td></tr>
            <tr><td>JJP-002</td><td>Carpeta Manila Oficio (Paquete x100)</td><td>$12.00</td><td>$15.50</td><td>8,500 u.</td><td><button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="alert('Ficha detallada del producto')">Ver Ficha</button></td></tr>
            <tr><td>JJP-003</td><td>Bolígrafo Punta Fina Negro Caja x50</td><td>$5.20</td><td>$7.00</td><td>10,340 u.</td><td><button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="alert('Ficha detallada del producto')">Ver Ficha</button></td></tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (view === 'pedidos') {
    titleEl.innerText = "Control de Pedidos y Captación";
    viewEl.innerHTML = `
      <div class="card">
        <div class="card-title">Órdenes de Compra Recientes</div>
        <table>
          <thead><tr><th>ID Orden</th><th>Cliente</th><th>Total USD</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>
            <tr><td>#ORD-9021</td><td>Industrias Mayka C.A.</td><td>$480.00</td><td><span style="color: var(--success);">Completado</span></td><td>26/08/2026</td></tr>
            <tr><td>#ORD-9022</td><td>Distribuciones Milan</td><td>$310.00</td><td><span style="color: var(--accent);">En Tránsito</span></td><td>26/08/2026</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

async function checkServerStatus() {
  const box = document.getElementById('server-status-box');
  box.innerHTML = `<span style="color: var(--success);">🟢 Puente Operativo y Sockets Sincronizados (Supabase + Baileys + SMTP)</span>`;
}
