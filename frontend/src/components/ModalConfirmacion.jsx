import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

const ModalConfirmacion = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  titulo = "¿Estás seguro?", 
  mensaje = "Esta acción no se puede deshacer." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop con desenfoque */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      {/* Card del Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        
        <h2 className="text-xl font-black text-center text-gray-900 uppercase italic mb-2 leading-tight">
          {titulo}
        </h2>
        <p className="text-xs text-center text-gray-400 font-bold leading-relaxed mb-8 px-4">
          {mensaje}
        </p>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform"
          >
            Volver
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;