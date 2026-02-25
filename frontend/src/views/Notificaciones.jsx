import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Clock, AlertTriangle, 
  MessageSquare, XCircle, History, CheckCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CardNotificacion from '../components/CardNotificacion'; // Importamos el componente que creamos arriba

const Notificaciones = () => {
  const navigate = useNavigate();

  // --- NOTA PARA BACKEND: Obtener el rol del Contexto de Usuario Global ---
  const [userRole] = useState('s&r'); 

  // --- NOTA PARA BACKEND: Este array será el resultado de su consulta a la base de datos ---
  const todasLasNotificaciones = [
    {
      id: 1,
      rol: 'admin',
      titulo: 'Mantenimiento culminado',
      descripcion: 'El GammaTech Modelo B1 ha terminado su revisión técnica.',
      icon: <CheckCircle className="text-green-500" />,
      color: 'border-green-100 bg-green-50/30'
    },
    {
      id: 2,
      rol: 'user',
      titulo: '¡Préstamo por vencer!',
      descripcion: 'Tu préstamo por el activo X300 vence mañana.',
      icon: <AlertTriangle className="text-orange-500" />,
      color: 'border-orange-100 bg-orange-50/30'
    },
    {
      id: 3,
      rol: 'gerente',
      titulo: 'Solicitud pendiente',
      descripcion: 'Tienes una nueva solicitud de activo por aprobar.',
      icon: <MessageSquare className="text-blue-500" />,
      color: 'border-blue-100 bg-blue-50/30'
    },
    {
      id: 4,
      rol: 'auditor',
      titulo: 'Activo movido',
      descripcion: 'Se detectó movimiento en la trazabilidad del activo HIL-1000.',
      icon: <History className="text-purple-500" />,
      color: 'border-purple-100 bg-purple-50/30'
    },
    {
      id: 5,
      rol: 's&r',
      titulo: 'Activo pendiente de envío',
      descripcion: 'Tienes una nueva solicitud de envío.',
      icon: <MessageSquare className="text-blue-500" />,
      color: 'border-blue-100 bg-blue-50/30'
    }
  ];

  // Lógica de filtrado por rol
  const misNotificaciones = todasLasNotificaciones.filter(n => n.rol === userRole);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />

      <main className="p-6 flex-1">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={28} className="text-[#0070BC]" />
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Notificaciones</h1>
        </div>

        {/* Mapeo dinámico usando el componente CardNotificacion */}
        <div className="space-y-4">
          {misNotificaciones.length > 0 ? (
            misNotificaciones.map((notif) => (
              <CardNotificacion key={notif.id} n={notif} />
            ))
          ) : (
            /* Estado vacío inspirado en tu diseño de Figma */
            <div className="flex flex-col items-center justify-center mt-20">
              <div className="bg-gray-50 p-8 rounded-full mb-6">
                <Bell size={64} className="text-gray-200" />
              </div>
              <p className="text-xl font-black text-gray-400">Sin notificaciones por hoy</p>
              <p className="text-sm font-bold text-gray-300 uppercase tracking-widest mt-1 italic">Todo al día</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notificaciones;