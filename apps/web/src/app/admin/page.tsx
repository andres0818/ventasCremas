'use client';

import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, XCircle, Search, X, MapPin, Phone, Mail, Hash, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  total: number;
  status: string;
  externalReference?: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Definimos la API fuera para reusarla
  const ORDER_API = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://127.0.0.1:3002';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('Fetching from:', `${ORDER_API}/api/orders`);
      const response = await fetch(`${ORDER_API}/api/orders`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setOrders(data);
        } else {
          setOrders(getMockData());
        }
      } else {
        setOrders(getMockData());
      }
    } catch (e) {
      console.error("Error fetching orders", e);
      setOrders(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsShipped = async (orderId: string) => {
    try {
      const response = await fetch(`${ORDER_API}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' })
      });
      
      if (response.ok) {
        setOrders(orders.map((o: Order) => o._id === orderId ? { ...o, status: 'shipped' } : o));
        if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: 'shipped' });
        alert('📦 Orden marcada como enviada');
      }
    } catch (error) {
      console.error("Error updating order", error);
      setOrders(orders.map((o: Order) => o._id === orderId ? { ...o, status: 'shipped' } : o));
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: 'shipped' });
    }
  };

  const getMockData = () => [
    { _id: '1', customerName: 'Andrés Felipe', email: 'a@test.com', phone: '312 456', city: 'Medellín', address: 'Calle 1', total: 85000, status: 'approved', createdAt: new Date().toISOString() }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Aprobado</span>;
      case 'shipped': return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Enviado</span>;
      default: return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">Pendiente</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Órdenes</h1>
          <button onClick={fetchOrders} className="text-sm text-blue-600 hover:underline">Actualizar</button>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <th className="p-4 pl-6">Cliente</th>
                <th className="p-4">Ciudad</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right pr-6">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50">
                  <td className="p-4 pl-6 font-medium">{order.customerName}</td>
                  <td className="p-4 text-sm">{order.city}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-right pr-6">
                    <button onClick={() => setSelectedOrder(order)} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Ver Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] p-8 border-l">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Detalle</h2>
                <X className="cursor-pointer" onClick={() => setSelectedOrder(null)} />
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Dirección</p>
                  <p className="font-medium">{selectedOrder.address}, {selectedOrder.city}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Contacto</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                </div>
                {selectedOrder.status !== 'shipped' ? (
                  <button onClick={() => handleMarkAsShipped(selectedOrder._id)} className="w-full bg-black text-white py-4 rounded-2xl font-medium">Marcar como Enviado</button>
                ) : (
                  <div className="w-full bg-blue-50 text-blue-700 py-4 rounded-2xl text-center font-medium">Ya enviado</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
