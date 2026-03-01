import React from 'react';
import { ChevronRight } from 'lucide-react';

// --- NOTA PARA BACKEND: Este componente recibe un objeto 'n' con los datos de la notificación ---
const CardNotificacion = ({ n }) => {
  // ✅ DESPUÉS (Limpio y listo para tu nueva "X")
return (
  <div className={`p-4 rounded-xl flex gap-4 pr-10 ${n.color}`}>
    <div className="bg-white p-2 rounded-full h-fit shadow-sm">
      {n.icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-gray-900">{n.titulo}</h3>
      <p className="text-sm text-gray-700 mt-1">{n.descripcion}</p>
      <span className="text-xs text-gray-400 mt-2 block">{n.fecha}</span>
    </div>
  </div>
);
};

export default CardNotificacion;