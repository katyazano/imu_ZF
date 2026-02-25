import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare, ShieldAlert } from 'lucide-react';
import Navbar from '../../components/Navbar';

const RiskApproval = () => {
  const [solicitudes, setSolicitudes] = useState([
    { id: '100002', tag: 'EQP-ADAS-0002', marca: 'GammaTech', modelo: 'Serie X100', descripcion: 'Cámara 4K para percepción visual' }
  ]);

  // Estados para Modales
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  const confirmApprove = () => {
    // Aquí el Back recibe la aprobación
    setSolicitudes(solicitudes.filter(s => s.id !== currentId));
    setShowApproveModal(false);
    alert("Solicitud Aceptada");
  };

  const confirmReject = () => {
    if(!rejectComment.trim()) return alert("Por favor, agrega un motivo");
    // Aquí el Back recibe el rechazo + comentario
    setSolicitudes(solicitudes.filter(s => s.id !== currentId));
    setShowRejectModal(false);
    setRejectComment('');
    alert("Solicitud Rechazada");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32">
      <Navbar />

      <main className="px-6 pt-10 flex-1">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-8 italic uppercase tracking-tighter">Solicitudes Scrap</h2>

        {/* Renderizado Condicional de Tarjetas */}
        {solicitudes.length > 0 ? (
            solicitudes.map((item) => (
            <div key={item.id} className="bg-white rounded-[30px] p-8 shadow-xl border border-gray-100 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-[#0070BC]">{item.tag}</h3>
              <span className="text-xs font-bold text-gray-400">ID: {item.id}</span>
            </div>

            <div className="text-xs space-y-2 mb-8 text-gray-600">
              <p><span className="font-black uppercase text-gray-800">Marca:</span> {item.marca}</p>
              <p><span className="font-black uppercase text-gray-800">Modelo:</span> {item.modelo}</p>
              <p className="italic leading-relaxed">{item.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setCurrentId(item.id); setShowRejectModal(true); }}
                className="py-3 rounded-2xl border-2 border-red-400 text-red-500 font-black uppercase text-xs tracking-widest"
              >
                Rechazar
              </button>

              <button onClick={() => { setCurrentId(item.id); setShowApproveModal(true); }}className="py-3 rounded-2xl bg-[#0070BC] text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200"            >
                Aprobar
              </button>
            </div>
            </div>
            ))
        ) : (
            /* ESTADO VACÍO MINIMALISTA */
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
                <ShieldAlert size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] italic">
                Sin solicitudes por hoy
            </p>
            </div>
        )}

        {/* MODAL DE APROBACIÓN */}
        {showApproveModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
              <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">¿Confirmar aprobación?</h3>
              <p className="text-sm text-gray-500 mb-8 italic">Se notificará a logística para proceder con la salida.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmApprove} className="w-full py-4 bg-[#0070BC] text-white rounded-2xl font-black uppercase tracking-widest">Sí, Aprobar</button>
                <button onClick={() => setShowApproveModal(false)} className="w-full py-4 text-gray-400 font-bold uppercase text-xs tracking-widest">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RECHAZO CON COMENTARIO */}
        {showRejectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-6 text-red-500">
                <AlertCircle size={28} />
                <h3 className="text-xl font-black uppercase italic">Rechazar Salida</h3>
              </div>
              
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-2">Motivo del rechazo</label>
              <textarea 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-red-400 transition-colors mb-6"
                placeholder="Escribe aquí por qué no cumple la normativa..."
                rows="4"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />

              <div className="flex flex-col gap-3">
                <button onClick={confirmReject} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-100">Confirmar Rechazo</button>
                <button onClick={() => { setShowRejectModal(false); setRejectComment(''); }} className="w-full py-4 text-gray-400 font-bold uppercase text-xs tracking-widest">Regresar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default RiskApproval;