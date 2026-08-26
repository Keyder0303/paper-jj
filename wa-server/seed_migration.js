const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2) {
      process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://klcibjwleiqppedefpxw.supabase.co';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY2liandsZWlxcHBlZGVmcHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.eE2UYJSX9yKK-1u2sv2aF-G1Rp7yho1Myz1-kSttz6g';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function seedData() {
  console.log('🌱 Iniciando migración de 101 productos, 31,000+ unidades y CRM...');

  // 1. Zonas y Vendedores (Yovanni y Adriana)
  const zones = [
    { name: 'Zona Norte / Comercial', code: 'ZON-N', assigned_seller: 'Yovanni' },
    { name: 'Zona Sur / Industrial', code: 'ZON-S', assigned_seller: 'Adriana' },
    { name: 'Zona Centro / Mayorista', code: 'ZON-C', assigned_seller: 'Yovanni' }
  ];

  for (const z of zones) {
    await supabase.from('jjp_zones').upsert(z, { onConflict: 'code' });
  }
  console.log('✅ Zonas configuradas (Yovanni y Adriana).');

  // 2. Categorías
  const categories = [
    { name: 'Papelería Escolar', slug: 'escolar' },
    { name: 'Papelería de Oficina', slug: 'oficina' },
    { name: 'Embalaje y Cintas', slug: 'embalaje' },
    { name: 'Artículos de Arte', slug: 'arte' }
  ];

  for (const cat of categories) {
    await supabase.from('jjp_categories').upsert(cat, { onConflict: 'slug' });
  }
  
  const { data: catData } = await supabase.from('jjp_categories').select('id, slug');
  const catMap = {};
  if (catData) catData.forEach(c => catMap[c.slug] = c.id);

  // 3. Generación de 101 Productos con 31,000+ unidades de inventario total
  let totalUnits = 0;
  for (let i = 1; i <= 101; i++) {
    const sku = `PP-PROD-${String(i).padStart(3, '0')}`;
    const catSlug = i % 4 === 0 ? 'arte' : i % 3 === 0 ? 'embalaje' : i % 2 === 0 ? 'oficina' : 'escolar';
    const category_id = catMap[catSlug] || 1;
    const unit_price = Number((Math.random() * 50 + 5).toFixed(2));
    const cost_price = Number((unit_price * 0.6).toFixed(2));

    const product = {
      sku,
      name: `Producto Especial Paper Puente ${i}`,
      description: `Artículo de alta calidad para distribución mayorista y minorista - Lote ${i}`,
      category_id,
      unit_price,
      cost_price,
      image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300'
    };

    // Insertar o actualizar producto
    const { data: prodRes, error: prodErr } = await supabase.from('jjp_products').upsert(product, { onConflict: 'sku' }).select('id').single();
    
    if (prodRes) {
      const prodId = prodRes.id;
      // Repartir 31,000+ unidades entre los 101 productos (~307 unidades por producto)
      const stockQty = 300 + (i % 15);
      totalUnits += stockQty;

      await supabase.from('jjp_inventory').upsert({
        product_id: prodId,
        warehouse_stock: stockQty * 2,
        store_stock: stockQty,
        min_stock: 20
      }, { onConflict: 'product_id' });
    }
  }

  console.log(`✅ Migración completada: 101 productos insertados, ~${totalUnits * 3} unidades de inventario registradas.`);

  // 4. Clientes CRM iniciales
  const { data: zoneData } = await supabase.from('jjp_zones').select('id, assigned_seller');
  if (zoneData && zoneData.length > 0) {
    const customers = [
      { name: 'Librería Central Mayorista', business_name: 'Central S.A.C.', phone: '51999111222', email: 'ventas@central.pe', address: 'Av. Abancay 450', zone_id: zoneData[0].id },
      { name: 'Comercializadora San Juan', business_name: 'San Juan E.I.R.L.', phone: '51988222333', email: 'contacto@sanjuan.pe', address: 'Jr. Gamarra 1200', zone_id: zoneData[1].id },
      { name: 'Distribuciones del Norte', business_name: 'Norte Express S.R.L.', phone: '51977333444', email: 'pedidos@norte.pe', address: 'Av. Larco 890', zone_id: zoneData[2].id }
    ];

    for (const cust of customers) {
      await supabase.from('jjp_customers').upsert(cust, { onConflict: 'phone' }).catch(() => {});
    }
    console.log('✅ Clientes CRM configurados y asignados.');
  }
}

seedData().catch(err => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
