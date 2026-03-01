import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModalExito = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-10 flex flex-col items-center text-center animate-in zoom-in duration-300">
        
        {/* Círculo verde con Icono */}
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle size={80} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase italic">
          ¡Tu solicitud ha sido enviada!
        </h2>
        
        <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed">
          Se ha enviado al gerente para su firma. Te notificaremos pronto.
        </p>

        <button 
          onClick={() => {
            onClose();
            navigate('/mis-solicitudes');
          }}
          className="w-full bg-green-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 uppercase tracking-widest active:scale-95 transition-all text-xs"
        >
          Ir a mis solicitudes
        </button>
      </div>
    </div>
  );
};

export default ModalExito;