const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuración de CORS unificada
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Variables de Entorno
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken || accessToken === 'TU_ACCESS_TOKEN_AQUI') {
  console.warn('⚠️ ALERTA: MP_ACCESS_TOKEN no configurado correctamente en .env');
}

const client = new MercadoPagoConfig({ accessToken: accessToken || 'PLACEHOLDER' });

// Endpoint: Crear Preferencia de Pago
app.post('/api/create-preference', async (req, res) => {
  console.log('🛒 Procesando solicitud de pago...');
  try {
    const { orderId, customerName, email } = req.body;

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
        payer: { name: customerName, email: email },
        external_reference: orderId.toString(),
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/failure`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pending`,
        },
        auto_return: 'approved',
        notification_url: process.env.WEBHOOK_URL, // Debe ser una URL pública
      }
    });

    console.log('✅ Preferencia generada:', result.id);
    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('❌ Error Mercado Pago:', error.message);
    res.status(500).json({ error: 'Error al generar link de pago' });
  }
});

// Endpoint: Webhook de Mercado Pago
app.post('/api/webhook', async (req, res) => {
  const paymentId = req.query.id || req.body.data?.id;

  if (req.body.type === 'payment' && paymentId) {
    try {
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const paymentData = response.data;
      const orderId = paymentData.external_reference;
      const status = paymentData.status;

      console.log(`💰 Pago ${paymentId} [${status}] para Orden ${orderId}`);

      if (orderId) {
        await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}`, {
          status: status,
          externalReference: paymentId.toString()
        });
        console.log('✅ Orden actualizada satisfactoriamente');
      }
    } catch (error) {
      console.error('❌ Error Webhook:', error.message);
    }
  }
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Payment Service en puerto ${PORT}`));
