const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));

// Configuración de PostgreSQL usando URL de conexión (Secreto de GitHub)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Requerido para la mayoría de DBs en la nube como Render/Supabase
});

// Inicialización de la Tabla (Se ejecuta al arrancar)
const initDB = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      total DECIMAL(12,2),
      status VARCHAR(50) DEFAULT 'pending',
      external_reference VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('✅ Tabla "orders" verificada/creada en PostgreSQL');
  } catch (err) {
    console.error('❌ Error al inicializar DB:', err.message);
  }
};
initDB();

// Endpoint: Crear Orden
app.post('/api/orders', async (req, res) => {
  const { customerName, email, phone, address, city, total } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, email, phone, address, city, total) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customerName, email, phone, address, city, total]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Listar Órdenes
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Actualizar Estado (Webhook/Admin)
app.patch('/api/orders/:id', async (req, res) => {
  const { status, externalReference } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, external_reference = $2 WHERE id = $3 RETURNING *',
      [status, externalReference || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`✅ Order Service (Postgres) en puerto ${PORT}`));
