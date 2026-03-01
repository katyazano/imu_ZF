import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, AlertTriangle, 
  MessageSquare, History, CheckCircle, Loader2, X 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CardNotificacion from '../components/CardNotificacion';

const Notificaciones = () => {
  const navigate = useNavigate();

  // 1. ESTADOS DINÁMICOS
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  
  // ✅ ESTADO PARA OCULTAR (Leemos del localStorage lo que el usuario ya borró)
  const [ocultas, setOcultas] = useState(() => {
    return JSON.parse(localStorage.getItem('zf_notifs_ocultas')) || [];
  });
  
  const rolID = parseInt(localStorage.getItem('rol')) || 2;

  // 2. DICCIONARIO DE ESTILOS
  const getConfigVisual = (tipo) => {
    const t = tipo?.toLowerCase() || 'info';
    
    const configs = {
      peticion: { icon: <MessageSquare className="text-blue-500" />, color: 'border-blue-100 bg-blue-50/30' },
      urgente: { icon: <AlertTriangle className="text-orange-500" />, color: 'border-orange-100 bg-orange-50/30' },
      vencimiento: { icon: <AlertTriangle className="text-red-500" />, color: 'border-red-100 bg-red-50/30' },
      exito: { icon: <CheckCircle className="text-green-500" />, color: 'border-green-100 bg-green-50/30' },
      movimiento: { icon: <History className="text-purple-500" />, color: 'border-purple-100 bg-purple-50/30' }
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
          
          const formateadas = data.map(n => {
            const estilo = getConfigVisual(n.tipo);
            return {
              id: n.id || n.id_notificacion, // Aseguramos tomar el ID correcto
              titulo: n.titulo,
              descripcion: n.mensaje,
              icon: estilo.icon,
              color: estilo.color,
              fecha: n.fecha || n.fecha_creacion,
              id_solicitud: n.id_solicitud 
            };
          });

          setNotificaciones(formateadas);

          // ✅ MARCAR COMO LEÍDAS AL ENTRAR A LA BANDEJA
          // Guardamos todos los IDs actuales en localStorage para que el Navbar lo sepa
          const idsActuales = formateadas.map(n => n.id);
          localStorage.setItem('zf_notifs_leidas', JSON.stringify(idsActuales));
          
          // Disparamos un evento para que el Navbar actualice la bolita roja al instante
          window.dispatchEvent(new Event('notificaciones_actualizadas'));
        }
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, [rolID]);

  // ✅ FUNCIÓN PARA OCULTAR (CERRAR) UNA NOTIFICACIÓN
  const handleOcultar = (e, id) => {
    e.stopPropagation(); // Evita que al darle a la X se abra la solicitud
    const nuevasOcultas = [...ocultas, id];
    setOcultas(nuevasOcultas);
    localStorage.setItem('zf_notifs_ocultas', JSON.stringify(nuevasOcultas));
    window.dispatchEvent(new Event('notificaciones_actualizadas')); // Avisamos al Navbar
  };

  const handleNotificacionClick = (id_solicitud) => {
    if (id_solicitud) {
      navigate(`/solicitud/${id_solicitud}`);
    }
  };

  // ✅ FILTRAMOS LAS NOTIFICACIONES PARA NO MOSTRAR LAS OCULTAS
  const notificacionesVisibles = notificaciones.filter(n => !ocultas.includes(n.id));

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />

      <main className="p-6 flex-1">
        {/* Encabezado */}
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
          ) : notificacionesVisibles.length > 0 ? (
            // Sustituye el map de tus notificaciones por esto:
notificacionesVisibles.map((notif) => (
  /* ✅ CONTENEDOR PRINCIPAL: Debe tener 'relative' para que la 'X' sepa dónde ubicarse */
  <div key={notif.id} className="relative group">
    
    {/* 1. LA TARJETA (El área que te lleva a la solicitud) */}
    <div 
      onClick={() => handleNotificacionClick(notif.id_solicitud)}
      className={notif.id_solicitud ? "cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]" : ""}
    >
      <CardNotificacion n={notif} />
    </div>

    {/* 2. EL BOTÓN DE CERRAR (Posicionado sobre la tarjeta) */}
    <button
      onClick={(e) => handleOcultar(e, notif.id)}
      className="absolute top-3 right-3 p-1.5 text-gray-400 bg-white/50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all duration-200 opacity-60 hover:opacity-100 shadow-sm border border-transparent hover:border-red-100 backdrop-blur-sm"
      title="Ocultar aviso"
    >
      <X size={16} strokeWidth={2.5} />
    </button>
  </div>
))
          ) : (
            /* Estado vacío */
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