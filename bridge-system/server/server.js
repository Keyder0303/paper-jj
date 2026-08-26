const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const SUPABASE_URL = "https://czzvsqnmxtjzqzioknnn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enZzcW5teHRqenF6aW9rbnnnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTE3OTYsImV4cCI6MjEwMzMyNzc5Nn0.mockkey";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', system: 'Bridge System JJ Paper Pro', timestamp: new Date() });
});

app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('jjp_products').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.json([
      { sku: 'JJP-001', name: 'Resma Papel Bond Base 20 A4', cost: 3.50, price: 4.80, stock: 12400 },
      { sku: 'JJP-002', name: 'Carpeta Manila Oficio (Paq x100)', cost: 12.00, price: 15.50, stock: 8500 },
      { sku: 'JJP-003', name: 'Bolígrafo Punta Fina Negro Caja x50', cost: 5.20, price: 7.00, stock: 10340 }
    ]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bridge System Pro running on port ${PORT}`);
});
