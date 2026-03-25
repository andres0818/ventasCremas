'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: any) => void;
  isLoading: boolean;
}

export default function CheckoutModal({ isOpen, onClose, onConfirm, isLoading }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-black">Finalizar Compra</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
                <Badge Icon={Truck} label="Envío Gratis" />
                <Badge Icon={CreditCard} label="Pago Seguro" />
                <Badge Icon={ShieldCheck} label="Garantía MP" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    label="Nombre Completo" 
                    placeholder="Ej. Juan Pérez" 
                    required 
                    value={formData.customerName}
                    onChange={(v) => setFormData({...formData, customerName: v})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="WhatsApp / Celular" 
                      placeholder="300 000 0000" 
                      required 
                      type="tel"
                      value={formData.phone}
                      onChange={(v) => setFormData({...formData, phone: v})}
                    />
                    <Input 
                      label="Correo Electrónico" 
                      placeholder="juan@email.com" 
                      required 
                      type="email"
                      value={formData.email}
                      onChange={(v) => setFormData({...formData, email: v})}
                    />
                  </div>
                  <Input 
                    label="Ciudad / Municipio" 
                    placeholder="Bogotá, Medellín..." 
                    required 
                    value={formData.city}
                    onChange={(v) => setFormData({...formData, city: v})}
                  />
                  <Input 
                    label="Dirección de Envío" 
                    placeholder="Calle 123 #45-67, Apto 101" 
                    required 
                    value={formData.address}
                    onChange={(v) => setFormData({...formData, address: v})}
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-light">Total a pagar (COP)</span>
                    <span className="text-2xl font-bold tracking-tight text-black">$85.000</span>
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-medium text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : 'Confirmar y Pagar'}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4 px-8">
                    Serás redirigido de forma segura a Mercado Pago para completar tu pago.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Input({ label, placeholder, required, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-black placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all w-full"
      />
    </div>
  );
}

function Badge({ Icon, label }: any) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full whitespace-nowrap">
      <Icon size={14} className="text-gray-500" />
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
}
