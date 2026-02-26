import React, { useState } from 'react';
import { 
  Truck, Package, CheckCircle2, XCircle, 
  AlertTriangle, ClipboardCheck, ChevronRight 
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const ShippingControl = () => {
  const [filtroActual, setFiltroActual] = useState('Pendientes');
  
  // --- MOCK DATA PARA BACKEND ---
  const [solicitudes, setSolicitudes] = useState([
    { id: 'SF-9901', usuario: 'Ing. Carlos Ruiz', destino: 'Planta QRO', tipo: 'Normal', estado: 'Pendientes' },
    { id: 'SF-9905', usuario: 'Dra. Elena Solís', destino: 'Reciclaje', tipo: 'Scrap', estado: 'Pendientes' },
    { id: 'SF-8820', usuario: 'Marcos Peña', destino: 'Mérida', tipo: 'Normal', estado: 'En Tránsito' },
    { id: 'SF-7741', usuario: 'Lucía Fernández', destino: 'Planta 2', tipo: 'Normal', estado: 'Rechazados' },
  ]);

  // Estados para Modales
  const [modalType, setModalType] = useState(null); // 'validate', 'reject', 'support'
  const [currentId, setCurrentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // --- FUNCIÓN PARA BACKEND (CORREGIDA) ---
  const handleAction = () => {
    // Aquí back conectarán su API
    // Por ahora, simulamos que el item cambia de estado o se elimina de pendientes
    console.log(`Acción ${modalType} ejecutada para el folio: ${currentId}`);
    
    // Si rechazamos o validamos, movemos el estado en nuestro mock local
    const nuevoEstado = modalType === 'reject' ? 'Rechazados' : 'En Tránsito';
    
    setSolicitudes(solicitudes.map(s => {
      if (s.id === currentId) {
        // Si la acción fue el soporte amarillo, marcamos que ya se hizo pero sigue pendiente de envío
        if (modalType === 'support') return { ...s, soporteHecho: true };
        // Si fue validar o rechazar, movemos el estado general
        return { ...s, estado: nuevoEstado };
      }
      return s;
    }));

    // Limpiamos estados y cerramos modal
    setModalType(null);
    setCurrentId(null);
    setRejectReason('');
    alert("Operación registrada con éxito");
  };

  // Filtrado de la lista según la pestaña seleccionada
  const solicitudesFiltradas = solicitudes.filter(s => s.estado === filtroActual);
  const filtros = ['Pendientes', 'En Tránsito', 'Devueltos', 'Rechazados'];

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-y-auto">
        {/* Header y Filtros Superiores */}
        <div className="bg-[#0070BC] p-6 pt-10 pb-16 shadow-lg">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Torre de<br/>Control</h1>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-white">
              <Truck size={24} />
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filtros.map((f) => (
              <button 
                key={f}
                onClick={() => setFiltroActual(f)}
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
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Listado {filtroActual}</h2>
            <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-2 py-0.5 rounded-md italic">
              {solicitudesFiltradas.length} Items
            </span>
          </div>

          {solicitudesFiltradas.length > 0 ? solicitudesFiltradas.map((item) => (
            <div key={item.id} className="bg-white rounded-[35px] p-6 shadow-xl border border-gray-50 relative overflow-hidden animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tighter">{item.id}</h3>
                <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${item.tipo === 'Scrap' ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-[#0070BC]'}`}>
                  {item.tipo}
                </div>
              </div>

              <p className="text-xs font-bold text-gray-600 mb-6 italic">{item.usuario} • {item.destino}</p>

              {/* LÓGICA DE BOTONES EXCLUYENTE */}
              {filtroActual === 'Pendientes' && (
                <div className="flex flex-col gap-2">
                  
                  {/* CASO A: Es Scrap y NO se ha dado soporte aún */}
                  {item.tipo === 'Scrap' && !item.soporteHecho ? (
                    <button 
                      onClick={() => { setCurrentId(item.id); setModalType('support'); }}
                      className="w-full py-4 bg-amber-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
                    >
                      <Package size={16}/> Autorizar Soporte Scrap
                    </button>
                  ) : (
                    /* CASO B: Es Normal O es Scrap con soporte ya realizado */
                    <div className="flex flex-col gap-2 animate-in fade-in duration-500">
                      {item.soporteHecho && (
                        <p className="text-[8px] font-black text-green-500 uppercase text-center mb-1 flex items-center justify-center gap-1">
                          <CheckCircle2 size={10}/> Soporte Scrap Validado
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { setCurrentId(item.id); setModalType('reject'); }} className="py-3 bg-red-50 text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-red-100">Rechazar</button>
                        <button onClick={() => { setCurrentId(item.id); setModalType('validate'); }} className="py-3 bg-[#0070BC] text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-blue-100">Validar Logística</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {filtroActual !== 'Pendientes' && (
                <button className="w-full py-3 bg-gray-50 text-gray-400 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                    Ver detalles del envío <ChevronRight size={14}/>
                </button>
              )}
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300 italic">
              <ClipboardCheck size={48} strokeWidth={1} className="mb-4 opacity-50" />
              <p className="font-black uppercase tracking-[0.2em] text-[9px]">Sin nada que revisar</p>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALES --- */}
      {modalType === 'validate' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck size={40} className="text-[#0070BC]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase italic">Confirmar Embarque</h3>
            <p className="text-xs text-gray-500 mb-8 font-medium italic">¿Confirmas que el transporte y la documentación logística están programados?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleAction} className="w-full py-4 bg-[#0070BC] text-white rounded-2xl font-black uppercase text-xs tracking-widest">Confirmar Salida</button>
              <button onClick={() => setModalType(null)} className="w-full py-4 text-gray-400 font-bold uppercase text-[10px]">Regresar</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Soporte Scrap */}
      {modalType === 'support' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase italic">Soporte Scrap</h3>
            <p className="text-xs text-gray-500 mb-8 font-medium italic italic">Validas que S&R ayudó en el empaquetado y pesaje del residuo.</p>
            <button onClick={handleAction} className="w-full py-4 bg-amber-400 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Autorizar y Firmar</button>
            <button onClick={() => setModalType(null)} className="w-full py-4 text-gray-400 font-bold uppercase text-[10px] mt-2">Cancelar</button>
          </div>
        </div>
      )}

      {/* 3. Modal Rechazo */}
      {modalType === 'reject' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Rechazar Envío</h3>
            </div>
            <textarea 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-red-400 mb-6 font-bold"
              placeholder="Explica el motivo del rechazo..."
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setModalType(null)} className="py-4 text-gray-400 font-black uppercase text-[10px]">Cerrar</button>
              <button onClick={handleAction} className="py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingControl;