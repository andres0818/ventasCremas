const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const axios = require('axios'); // Añadimos axios
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// URL del Microservicio de Órdenes (Variable de entorno en GitHub)
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';

// Token de Mercado Pago
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken || accessToken === 'TU_ACCESS_TOKEN_AQUI') {
  console.warn('⚠️ ALERTA: No se ha configurado un MP_ACCESS_TOKEN válido en el archivo .env');
}

const client = new MercadoPagoConfig({ accessToken: accessToken || 'PLACEHOLDER' });

app.post('/api/create-preference', async (req, res) => {
  console.log('--- Iniciando creación de preferencia de pago ---');
  try {
    const { orderId, customerName, email } = req.body; // Recibimos el ID de la orden

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'skin-clear-001',
            title: 'Crema Aclarante - Skin Clear',
            quantity: 1,
            unit_price: 85000,
            currency_id: 'COP',
          }
        ],
        payer: {
          name: customerName,
          email: email
        },
        external_reference: orderId, // Vinculamos el pago a la orden
        back_urls: {
          success: 'http://localhost:3000/success',
          failure: 'http://localhost:3000/failure',
          pending: 'http://localhost:3000/pending',
        },
        auto_return: 'approved',
        // El puerto 3001 debe estar expuesto a internet (ej. Ngrok) para recibir esto
        notification_url: 'https://tu-dominio.com/api/webhook', 
      }
    });

    console.log('✅ Preferencia creada con éxito ID:', result.id);
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('❌ Error en Mercado Pago:', error.message || error);
    res.status(500).json({ 
      error: 'Error al generar link de pago',
      details: error.message 
    });
  }
});

// Endpoint del Webhook
app.post('/api/webhook', async (req, res) => {
  console.log('🔔 Webhook recibido de Mercado Pago', req.body);
  const paymentId = req.query.id || req.body.data?.id;

  if (req.body.type === 'payment' && paymentId) {
    try {
      // 1. Consultar el estado real del pago en MP
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const paymentData = response.data;
      const orderId = paymentData.external_reference;
      const status = paymentData.status; // 'approved', 'rejected', etc.

      console.log(`💰 Pago ${paymentId} para la orden ${orderId} está: ${status}`);

      // 2. Avisar al Microservicio de Órdenes
      if (orderId) {
        await axios.patch(`http://localhost:3002/api/orders/${orderId}`, {
          status: status,
          externalReference: paymentId.toString()
        });
        console.log('✅ Microservicio de Órdenes actualizado con éxito');
      }

    } catch (error) {
      console.error('❌ Error procesando Webhook:', error.message);
    }
  }
  res.status(200).send('OK'); // Siempre responder 200 rápido a Mercado Pago
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Payment Service corriendo en puerto ${PORT}`);
});
