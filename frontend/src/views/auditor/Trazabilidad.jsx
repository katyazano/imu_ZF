import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, History, Package, User, 
  Settings, Truck, Info, CheckCircle2 
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const Trazabilidad = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- NOTA PARA BACKEND: Este historial debe venir de una consulta JOIN a las tablas 
  // de Préstamos, Mantenimientos y Logs de Inventario del activo con este ID ---
  const historialActivo = [
    {
      tipo: 'ADQUISICIÓN',
      detalle: 'Factura #2025-001',
      fecha: '02/11/2025',
      icon: <Package className="text-blue-500" />,
      lineColor: 'border-blue-500'
    },
    {
      tipo: 'ASIGNADO',
      detalle: 'A Juan Pérez (Proyecto "Alpha")',
      fecha: '06/11/2025',
      icon: <User className="text-gray-400" />,
      lineColor: 'border-gray-300'
    },
    {
      tipo: 'MOVIMIENTO',
      detalle: 'De "Almacén A" a "Oficina A"',
      fecha: '23/11/2025',
      icon: <Truck className="text-[#28B4AD]" />,
      lineColor: 'border-[#28B4AD]'
    },
    {
      tipo: 'MANTENIMIENTO',
      detalle: 'Revisión programada preventiva',
      fecha: '20/12/2025',
      icon: <Settings className="text-orange-400" />,
      lineColor: 'border-orange-400'
    },
    {
      tipo: 'PRÉSTAMO ACTUAL',
      detalle: 'A María Carmen Gómez (Proyecto "Beta")',
      fecha: '25/01/2026',
      icon: <CheckCircle2 className="text-[#0070BC]" />,
      lineColor: 'border-[#0070BC]'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32">
      <Navbar />

      {/* Header Estilo ZF */}
     <div className="bg-[#0070BC] p-8 pt-12 pb-20 shadow-lg">
      <div className="relative flex items-center justify-center min-h-[40px]">
        
        {/* Botón Volver - Posicionado a la izquierda */}
        <button 
          onClick={() => navigate('/auditorDashboard')} 
          className="absolute left-0 flex flex-col items-center text-white hover:scale-105 transition-transform group"
        >
          <ArrowLeft size={24} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-80 group-hover:opacity-100">
            Volver al Dashboard
          </span>
        </button>

        {/* Título Principal - Centrado en la página */}
        <h1 className="text-xl font-black text-white italic uppercase tracking-tighter text-center max-w-[180px] leading-tight">
          Trazabilidad de activo
        </h1>
        </div>
      </div>

      <main className="px-6 -mt-12 flex-1">
        {/* Card Informativa del Activo */}
        <div className="bg-white rounded-[35px] p-6 shadow-xl shadow-blue-900/5 mb-8 border border-blue-50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-none">ACTIVO ID: {id || '10001'}</h2>
              <p className="text-sm font-bold text-gray-400 mt-2">BetaWorks Serie X300</p>
            </div>
            <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
              En préstamo
            </span>
          </div>
        </div>

        {/* Línea de Tiempo (Timeline) */}
        <div className="bg-white rounded-[35px] p-8 shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <History size={18} className="text-[#0070BC]" /> Historial completo
          </h3>

          <div className="relative">
            {historialActivo.map((evento, index) => (
              <div key={index} className="flex gap-6 mb-10 last:mb-0 relative">
                {/* La línea conectora vertical */}
                {index !== historialActivo.length - 1 && (
                  <div className={`absolute left-[19px] top-10 w-[2px] h-full border-l-2 border-dashed ${evento.lineColor}`}></div>
                )}
                
                {/* El círculo con el icono */}
                <div className={`z-10 w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center shadow-sm ${evento.lineColor.replace('border-', 'text-')}`}>
                  {evento.icon}
                </div>

                {/* El texto descriptivo */}
                <div className="flex-1 pt-1">
                  <div className="flex flex-col">
                    <h4 className="font-black text-[11px] text-gray-900 uppercase tracking-widest leading-none mb-1">
                      {evento.tipo}: <span className="text-gray-400 font-bold lowercase tracking-normal italic text-xs">{evento.detalle}</span>
                    </h4>
                    <span className="text-[10px] font-black text-[#0070BC] uppercase tracking-tighter">
                      el {evento.fecha}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trazabilidad;