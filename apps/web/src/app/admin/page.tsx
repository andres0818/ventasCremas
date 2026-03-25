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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:3002/api/orders');
      if (response.ok) {
        const data = await response.json();
        // Si hay datos reales, los usamos; si no, usamos Mock Data
        if (data.length > 0) {
          setOrders(data);
        } else {
          setOrders(getMockData());
        }
      } else {
        setOrders(getMockData());
      }
    } catch (e) {
      console.error("Error fetching orders, using mock data", e);
      setOrders(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => [
    { 
      _id: '65f123abc456def7890001', 
      customerName: 'Andrés Felipe Restrepo', 
      email: 'andres.felipe@email.com',
      phone: '312 456 7890', 
      city: 'Medellín', 
      address: 'Carrera 43A #1-50, El Poblado',
      total: 85000, 
      status: 'approved', 
      externalReference: 'MP-987654321',
      createdAt: new Date().toISOString() 
    },
    { 
      _id: '65f123abc456def7890002', 
      customerName: 'Valentina Gómez', 
      email: 'valen.gomez@email.com',
      phone: '300 987 6543', 
      city: 'Bogotá', 
      address: 'Calle 100 #15-20, Apto 502',
      total: 85000, 
      status: 'pending', 
      externalReference: null,
      createdAt: new Date(Date.now() - 3600000).toISOString() 
    },
    { 
      _id: '65f123abc456def7890003', 
      customerName: 'Carlos Mario Quintero', 
      email: 'carlos.m@email.com',
      phone: '320 123 4455', 
      city: 'Cali', 
      address: 'Avenida 6N #20-30',
      total: 85000, 
      status: 'rejected', 
      externalReference: 'MP-FAILED-001',
      createdAt: new Date(Date.now() - 86400000).toISOString() 
    },
    { 
      _id: '65f123abc456def7890004', 
      customerName: 'Camila Torres', 
      email: 'cami.torres@email.com',
      phone: '315 555 6677', 
      city: 'Barranquilla', 
      address: 'Calle 72 #54-10, Edificio Royal',
      total: 85000, 
      status: 'approved', 
      externalReference: 'MP-11223344',
      createdAt: new Date(Date.now() - 172800000).toISOString() 
    }
  ];

  const handleMarkAsShipped = async (orderId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:3002/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shipped' })
      });
      
      if (response.ok) {
        // Actualizar el estado localmente para feedback inmediato
        setOrders(orders.map((o: Order) => o._id === orderId ? { ...o, status: 'shipped' } : o));
        
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: 'shipped' });
        }
        
        alert('📦 Orden marcada como enviada con éxito');
      }
    } catch (error) {
      console.error("Error updating order", error);
      // Fallback para Mock Data si no hay conexión real
      setOrders(orders.map((o: Order) => o._id === orderId ? { ...o, status: 'shipped' } : o));
      
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: 'shipped' });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium"><CheckCircle size={14}/> Aprobado</span>;
      case 'shipped': return <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"><Package size={14}/> Enviado</span>;
      case 'pending': return <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium"><Clock size={14}/> Pendiente</span>;
      default: return <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium"><XCircle size={14}/> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Órdenes</h1>
            <p className="text-gray-500 mt-1">Gestiona los envíos de SkinClear</p>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 px-4">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Buscar cliente..." className="bg-transparent border-none focus:outline-none text-sm w-48" />
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Cliente</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Ubicación</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right pr-6">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">#{order._id.substring(0,8)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      {order.phone}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{order.city}</p>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-black bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-100"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && !loading && (
            <div className="p-12 text-center flex flex-col items-center">
              <Package size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Aún no hay órdenes</h3>
              <p className="text-gray-500">Tus ventas aparecerán aquí.</p>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel de Detalle */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] border-l border-gray-100 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-bold tracking-tight text-black">Detalle de Orden</h2>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Estado Card */}
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Estado del Pago</p>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(selectedOrder.status)}
                      <p className="text-sm font-mono text-gray-400">Ref: {selectedOrder.externalReference || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Cliente Info */}
                  <section>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Información del Cliente</p>
                    <div className="space-y-4">
                      <DetailRow Icon={Package} label="Nombre" value={selectedOrder.customerName} />
                      <DetailRow Icon={Phone} label="Teléfono" value={selectedOrder.phone} isCopyable />
                      <DetailRow Icon={Mail} label="Email" value={selectedOrder.email} />
                    </div>
                  </section>

                  {/* Envío Info */}
                  <section>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Dirección de Envío</p>
                    <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                          <MapPin size={18} className="text-black" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedOrder.city}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{selectedOrder.address}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Metadata */}
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <Hash size={12} />
                      <span>ID: {selectedOrder._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="pt-4">
                    {selectedOrder.status !== 'shipped' ? (
                      <button 
                        onClick={() => handleMarkAsShipped(selectedOrder._id)}
                        className="w-full bg-black text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                      >
                        Marcar como Enviado <ArrowRight size={18} />
                      </button>
                    ) : (
                      <div className="w-full bg-blue-50 text-blue-700 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 border border-blue-100">
                        <Package size={18} /> Ya ha sido enviado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ Icon, label, value, isCopyable = false }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 bg-gray-50 group-hover:bg-white rounded-xl flex items-center justify-center transition-colors border border-transparent group-hover:border-gray-100">
        <Icon size={18} className="text-gray-400 group-hover:text-black transition-colors" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
      {isCopyable && (
        <button 
          onClick={() => {
            navigator.clipboard.writeText(value);
            alert('Copiado al portapapeles');
          }}
          className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Copiar
        </button>
      )}
    </div>
  );
}
