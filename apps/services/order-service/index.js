const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Endpoint de salud (para pruebas de red)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Order Service está vivo' });
});

// Conexión a Base de Datos (MongoDB)
// Puedes usar MongoDB Atlas o una instancia local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skinclear';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB (Order Service)'))
  .catch(err => console.error('❌ Error conexión DB:', err));

// Modelo de Orden
const OrderSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'pending' }, // pending, approved, rejected, shipped
  externalReference: String, // ID de Mercado Pago
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

// Endpoint para crear orden inicial
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, email, phone, address, city, total } = req.body;
    
    const newOrder = new Order({
      customerName,
      email,
      phone,
      address,
      city,
      total,
      items: [{ title: 'Crema SkinClear', quantity: 1, price: total }]
    });

    const savedOrder = await newOrder.save();
    console.log('📦 Nueva orden registrada:', savedOrder._id);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    res.status(500).json({ error: 'Error interno al procesar la orden' });
  }
});

// Endpoint para obtener todas las órdenes (Para el Dashboard Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Las más recientes primero
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Endpoint para actualizar estado de pago (Webhooks)
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { status, externalReference } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status, externalReference },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Order Service corriendo en puerto ${PORT}`);
});
