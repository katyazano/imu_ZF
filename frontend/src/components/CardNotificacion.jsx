import React from 'react';
import { ChevronRight } from 'lucide-react';

// --- NOTA PARA BACKEND: Este componente recibe un objeto 'n' con los datos de la notificación ---
const CardNotificacion = ({ n }) => {
  return (
    <div 
      className={`flex items-start gap-4 p-5 rounded-[25px] border-2 shadow-sm animate-in slide-in-from-right duration-300 transition-all active:scale-[0.98] ${n.color}`}
    >
      <div className="mt-1">{n.icon}</div>
      <div className="flex-1">
        <h3 className="font-extrabold text-gray-900 leading-tight">{n.titulo}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-snug font-medium">{n.descripcion}</p>
      </div>
      <ChevronRight size={20} className="text-gray-300 self-center" />
    </div>
  );
};

export default CardNotificacion;