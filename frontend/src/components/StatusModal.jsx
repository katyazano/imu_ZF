import React from 'react';
import { X, CheckCircle, Loader2, Wrench, Play, Clock, Power } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, onUpdate, currentStatusId, loading }) => {
  if (!isOpen) return null;

  const estadosConfig = [
    { id: 1, label: 'Operativa', color: 'bg-[#28B4AD]', icon: <Play size={18} />, desc: 'Equipo disponible para préstamos.' },
    { id: 2, label: 'En mantenimiento', color: 'bg-orange-500', icon: <Wrench size={18} />, desc: 'Fuera de servicio por reparación.' },
    { id: 3, label: 'Prestada', color: 'bg-[#0070BC]', icon: <Clock size={18} />, desc: 'Actualmente asignada a un usuario.' },
    { id: 4, label: 'Dada de baja', color: 'bg-gray-900', icon: <Power size={18} />, desc: 'Retirada definitivamente del inventario.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-gray-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[45px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">
            Cambiar Estado
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          {estadosConfig.map((estado) => (
            <button
              key={estado.id}
              onClick={() => onUpdate(estado.id)}
              disabled={loading || currentStatusId === estado.id}
              className={`w-full flex items-center p-4 rounded-3xl border-2 transition-all active:scale-[0.98]
                ${currentStatusId === estado.id 
                  ? 'border-[#0070BC] bg-blue-50/50' 
                  : 'border-gray-50 bg-white hover:border-gray-200'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg ${estado.color}`}>
                {loading && currentStatusId !== estado.id ? <Loader2 className="animate-spin" size={18} /> : estado.icon}
              </div>
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest text-gray-900">{estado.label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{estado.desc}</p>
              </div>
              {currentStatusId === estado.id && (
                <CheckCircle size={20} className="ml-auto text-[#0070BC]" />
              )}
            </button>
          ))}
        </div>
        
        <p className="mt-6 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          ZF Asset Management System
        </p>
      </div>
    </div>
  );
};

export default StatusModal;