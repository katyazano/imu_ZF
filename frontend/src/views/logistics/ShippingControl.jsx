import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Truck, Package, CheckCircle2, ClipboardCheck, 
  Calendar, MapPin, Loader2, Check
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ShippingModal from '../../components/ShippingModal';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ShippingControl = () => {
  const [filtroActual, setFiltroActual] = useState('Pendientes de envío');
  const [panelData, setPanelData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal (Limpios)
  const [modalType, setModalType] = useState(null); 
  const [currentFirmaId, setCurrentFirmaId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  
  const [searchParams] = useSearchParams();
  const queryDeBusqueda = searchParams.get('q')?.toLowerCase() || '';
  const token = localStorage.getItem('token');

  // 1. CARGA DESDE EL NUEVO ENDPOINT
  const fetchPanel = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/aprobaciones/logistica/historial`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPanelData(data);
      }
    } catch (error) {
      console.error("Error al cargar logística:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanel();
  }, []);

  // 2. ACCIÓN DE FIRMA
  const handleAction = async () => {
    setLoadingAction(true);
    try {
      const estatus_firma = modalType === 'reject' ? 'Rechazada' : 'Aprobada';
      const comentarios = modalType === 'reject' ? rejectReason : 
                          modalType === 'support' ? "Soporte de pesaje y empaque validado por S&R" : 
                          "Documentación logística y transporte validados";

      const response = await fetch(`${baseUrl}/aprobaciones/dictaminar/${currentFirmaId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus_firma, comentarios })
      });

      if (response.ok) {
        // Recargamos el panel completo desde la base de datos para que los filtros del backend actúen
        await fetchPanel();
        setModalType(null);
        setCurrentFirmaId(null);
        setRejectReason('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al procesar la firma.");
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setLoadingAction(false);
    }
  };

  const filtros = ['Pendientes de envío', 'En tránsito', 'Devueltos'];
  const filtradas = panelData.filter(item => {
    const coincidePestana = item.estado === filtroActual;
    
    const coincideBusqueda = queryDeBusqueda === '' || 
                             item.folio.toLowerCase().includes(queryDeBusqueda) ||
                             item.nombre_maquina.toLowerCase().includes(queryDeBusqueda) ||
                             item.destino.toLowerCase().includes(queryDeBusqueda);

    return coincidePestana && coincideBusqueda;
  });

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-[#0070BC] p-6 pt-10 pb-16 shadow-lg">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Monitor de<br/>Envíos</h1>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-white">
              <Truck size={24} />
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filtros.map((f) => (
              <button key={f} onClick={() => setFiltroActual(f)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  filtroActual === f ? 'bg-[#28B4AD] text-white shadow-lg scale-105' : 'bg-black/10 text-white/60 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <main className="px-6 -mt-8 flex flex-col gap-6 pb-40">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{filtroActual}</h2>
            <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-2 py-0.5 rounded-md italic">
              {filtradas.length} Items
            </span>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <Loader2 className="animate-spin mb-4" size={40} />
             </div>
          ) : filtradas.length > 0 ? filtradas.map((item) => (
            
            <div key={item.id_firma} className="bg-white rounded-[30px] p-6 shadow-xl border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-[#0070BC] tracking-tighter uppercase italic">{item.nombre_maquina}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sol: {item.solicitante}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${item.tipo_salida === 'Scrap' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'}`}>
                  {item.tipo_salida}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 border border-gray-100">
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <MapPin size={16} className="text-[#0070BC]" />
                  <span><span className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Destino:</span> {item.destino}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <Truck size={16} className="text-[#0070BC]" />
                  <span><span className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Método:</span> {item.metodo_transporte}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <Calendar size={16} className="text-[#0070BC]" />
                  <span><span className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Salida:</span> {item.fecha_salida}</span>
                </div>
              </div>

              {filtroActual === 'Pendientes de envío' ? (
                <div className="flex flex-col gap-3">
                  {item.tipo_salida === 'Scrap' ? (
                    <button onClick={() => { setCurrentFirmaId(item.id_firma); setModalType('support'); }} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-transform">
                      <Package size={18}/> Autorizar Soporte
                    </button>
                  ) : (
                    <button onClick={() => { setCurrentFirmaId(item.id_firma); setModalType('validate'); }} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-95 transition-transform">
                      <CheckCircle2 size={18}/> Validar Logística
                    </button>
                  )}
                  <button onClick={() => { setCurrentFirmaId(item.id_firma); setModalType('reject'); }} className="w-full py-3 bg-transparent text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-red-100 hover:bg-red-50 active:scale-95 transition-colors">
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  <Check size={16} /> Operación Registrada
                </div>
              )}
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300 italic">
              <ClipboardCheck size={48} strokeWidth={1} className="mb-4 opacity-50" />
              <p className="font-black uppercase tracking-[0.2em] text-[9px]">
                {filtroActual === 'Pendientes de envío' ? 'Bandeja S&R Vacía' : `Sin registros en ${filtroActual}`}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* USO DEL MODAL EXTERNO */}
      <ShippingModal 
        isOpen={!!modalType}
        type={modalType}
        onClose={() => setModalType(null)}
        onConfirm={handleAction}
        loading={loadingAction}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
      />
    </div>
  );
};

export default ShippingControl;