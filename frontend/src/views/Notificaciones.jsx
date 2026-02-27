import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, AlertTriangle, 
  MessageSquare, History, CheckCircle, Loader2 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CardNotificacion from '../components/CardNotificacion';

const Notificaciones = () => {
  const navigate = useNavigate();

  // 1. ESTADOS DINÁMICOS
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  
  // Obtenemos el rol actual para saber qué filtrar (aunque el backend ya debería filtrarlo)
  const rolID = parseInt(localStorage.getItem('rol')) || 2;

  // 2. DICCIONARIO DE ESTILOS (Mapea el tipo de la BD a la UI)
  const getConfigVisual = (tipo) => {
    const t = tipo?.toLowerCase() || 'info';
    
    const configs = {
      peticion: { 
        icon: <MessageSquare className="text-blue-500" />, 
        color: 'border-blue-100 bg-blue-50/30' 
      },
      urgente: { 
        icon: <AlertTriangle className="text-orange-500" />, 
        color: 'border-orange-100 bg-orange-50/30' 
      },
      vencimiento: { 
        icon: <AlertTriangle className="text-red-500" />, 
        color: 'border-red-100 bg-red-50/30' 
      },
      exito: { 
        icon: <CheckCircle className="text-green-500" />, 
        color: 'border-green-100 bg-green-50/30' 
      },
      movimiento: { 
        icon: <History className="text-purple-500" />, 
        color: 'border-purple-100 bg-purple-50/30' 
      }
    };

    return configs[t] || { icon: <Bell className="text-gray-400" />, color: 'border-gray-100 bg-gray-50/30' };
  };

  // 3. CARGA DE DATOS DESDE EL BACKEND
  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        const response = await fetch(`${baseUrl}/notificaciones`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Transformamos lo que viene de la BD al formato que usa CardNotificacion
          const formateadas = data.map(n => {
            const estilo = getConfigVisual(n.tipo);
            return {
              id: n.id_notificacion,
              titulo: n.titulo,
              descripcion: n.mensaje,
              icon: estilo.icon,
              color: estilo.color,
              fecha: n.fecha_creacion // Por si quieres mostrar la hora
            };
          });

          setNotificaciones(formateadas);
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, [rolID]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />

      <main className="p-6 flex-1">
        {/* Encabezado con tu estilo original */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-50 rounded-full transition-all active:scale-90"
          >
            <ArrowLeft size={28} className="text-[#0070BC]" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none italic uppercase">Avisos</h1>
            <div className="w-8 h-1 bg-[#0070BC] mt-1 rounded-full"></div>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando bandeja...</p>
            </div>
          ) : notificaciones.length > 0 ? (
            notificaciones.map((notif) => (
              <CardNotificacion key={notif.id} n={notif} />
            ))
          ) : (
            /* Estado vacío: Tu diseño de Figma */
            <div className="flex flex-col items-center justify-center mt-20 animate-in fade-in zoom-in duration-500">
              <div className="bg-gray-50 p-10 rounded-full mb-6 border-2 border-dashed border-gray-100">
                <Bell size={64} className="text-gray-200" />
              </div>
              <p className="text-xl font-black text-gray-400 uppercase italic">Sin pendientes</p>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2 italic">Todo bajo control en ZF</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notificaciones;