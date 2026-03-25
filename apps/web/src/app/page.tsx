'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import CheckoutModal from '@/components/CheckoutModal';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartPurchase = () => {
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async (userData: any) => {
    setLoading(true);
    // Tomamos las URLs de las variables de entorno o usamos localhost por defecto
    const ORDER_API = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://127.0.0.1:3002';
    const PAYMENT_API = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://127.0.0.1:3001';

    try {
      const orderResponse = await fetch(`${ORDER_API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, total: 85000 }),
      });
      const orderData = await orderResponse.json();

      const paymentResponse = await fetch(`${PAYMENT_API}/api/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.id || orderData._id, ...userData })
      });
      const paymentData = await paymentResponse.json();

      if (paymentData.init_point) {
        window.location.href = paymentData.init_point;
      }
    } catch (error) {
      console.error('Error al procesar compra', error);
      alert('Hubo un error al procesar tu compra. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white selection:bg-black selection:text-white">
      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        isLoading={loading}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: 'SkinClear Cream',
            image: ['https://tu-dominio.com/product.jpg'],
            description: 'Crema aclarante facial con nanotecnología.',
            brand: { '@type': 'Brand', name: 'SkinClear' },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'COP',
              price: '85000',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />

      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-semibold tracking-tight">SkinClear</span>
        <button 
          onClick={handleStartPurchase}
          className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95"
        >
          Comprar Ahora
        </button>
      </nav>

      <section className="pt-32 pb-20 px-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <span className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 block">Resultados visibles en 15 días</span>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-black to-gray-500">
            Piel perfecta.<br />Sin manchas.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            La primera crema aclaradora con nanotecnología diseñada para unificar el tono de tu rostro mientras duermes.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={handleStartPurchase}
              className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
            >
              <ShoppingCart size={20} /> Comprar por $85.000 COP
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 relative w-full max-w-md aspect-square bg-gradient-to-tr from-gray-50 to-gray-200 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border border-gray-100"
        >
          <div className="text-gray-300 font-bold text-4xl transform rotate-12 select-none uppercase">SkinClear Cream</div>
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"></div>
        </motion.div>
      </section>

      <section className="bg-gray-50 py-24 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard Icon={ShieldCheck} title="Dermatológicamente Probada" description="Fórmula hipoalergénica segura para todo tipo de pieles." />
          <FeatureCard Icon={Zap} title="Resultados Rápidos" description="Tecnología de absorción profunda que actúa desde la primera aplicación." />
          <FeatureCard Icon={Star} title="Ingredientes Naturales" description="Extractos botánicos premium que nutren y aclaran." />
        </div>
      </section>

      <section className="py-32 px-8 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-black">Resultados reales.</h2>
            <p className="text-gray-500 font-light text-lg">Más de 5.000 personas en Colombia ya transformaron su rostro.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard name="Isabella Martínez" city="Medellín" text="Tenía manchas de acné que no se iban con nada. En solo 3 semanas mi piel está mucho más uniforme." delay={0.1} />
            <TestimonialCard name="Juan David Rojas" city="Bogotá" text="La uso después de afeitarme y ha ayudado mucho con las manchas de irritación. Textura ligera." delay={0.2} />
            <TestimonialCard name="Marta Lucía Soto" city="Cali" text="A mis 52 años, las manchas de sol eran mi mayor inseguridad. SkinClear me devolvió la luminosidad." delay={0.3} />
          </div>
        </div>
      </section>

      <section className="py-24 px-8 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-black mb-4">Tu ritual nocturno</h2>
            <p className="text-gray-500 font-light text-lg">Tres pasos simples para una piel renovada cada mañana.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepItem num="01" title="Limpia profundamente" description="Lava tu rostro con agua tibia y un jabón neutro." />
            <StepItem num="02" title="Aplica SkinClear" description="Distribuye una pequeña cantidad sobre las manchas." />
            <StepItem num="03" title="Descansa y renueva" description="Deja que la nanotecnología actúe mientras duermes." />
          </div>
        </div>
      </section>

      <section className="py-32 px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-black mb-16 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <FaqItem question="¿Es seguro para todo tipo de piel?" answer="Sí, SkinClear ha sido probada en todo tipo de pieles colombianas. Libre de parabenos." />
            <FaqItem question="¿Cuánto tarda en llegar mi pedido?" answer="Enviamos desde Bogotá. Ciudades principales reciben en 2-3 días hábiles." />
            <FaqItem question="¿Puedo usarla durante el día?" answer="No. Es de uso nocturno exclusivo. Usa siempre protector solar SPF 50+ durante el día." />
            <FaqItem question="¿Sirve para manchas antiguas?" answer="Sí. La nanotecnología fragmenta la melanina acumulada por años." />
          </div>
        </div>
      </section>

      <section className="py-24 px-8 border-t border-gray-100 bg-gray-50/50 text-center">
        <h2 className="text-3xl font-semibold mb-8 tracking-tight">¿Lista para el cambio?</h2>
        <button onClick={handleStartPurchase} className="bg-black text-white px-12 py-5 rounded-full text-xl font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10">
          Comprar SkinClear ahora
        </button>
        <p className="mt-6 text-gray-400 text-sm">Envío gratis a toda Colombia • Pago 100% seguro</p>
      </section>
    </main>
  );
}

function FeatureCard({ Icon, title, description }: { Icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
        <Icon size={24} className="text-black" />
      </div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-gray-500 font-light leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, city, text, delay }: { name: string, city: string, text: string, delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay, duration: 0.6 }} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 group">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-black text-black" />)}
      </div>
      <p className="text-gray-800 leading-relaxed mb-8 font-light italic">"{text}"</p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <h4 className="font-semibold text-sm text-black">{name}</h4>
          <p className="text-xs text-gray-400">{city}, CO</p>
        </div>
      </div>
    </motion.div>
  );
}

function StepItem({ num, title, description }: { num: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-5xl font-bold text-gray-100 mb-6 font-sans leading-none">{num}</div>
      <h3 className="text-xl font-semibold mb-4 text-black">{title}</h3>
      <p className="text-gray-500 font-light leading-relaxed">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex justify-between items-center text-left px-4 rounded-2xl transition-all">
        <span className="text-lg font-medium text-gray-900 pr-8">{question}</span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-gray-300 text-3xl font-light">+</motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-6 px-4 text-gray-500 font-light">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
