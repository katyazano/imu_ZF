import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Wrench, Trash2, ClipboardList, History, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const ActivoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. ESTADOS
  const [userRole] = useState('auditor'); // --- NOTA BACKEND: Cambiar por rol real del usuario ---
  const [showModal, setShowModal] = useState(null); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [proyectoAsignado, setProyectoAsignado] = useState('');
  const [motivoMantenimiento, setMotivoMantenimiento] = useState('')

 // --- NOTA PARA BACKEND: Datos del activo que se enviarán en el JSON ---
  const activo = {
    id: id || '100001',
    nombre: 'BetaWorks Serie X300',
    estado: 'Disponible',
    categoria: 'Línea de producción',
    marca: 'BetaWorks',
    modelo: 'Serie X300',
    serie: 'SN41116573584',
    ubicacion: 'Validación HIL - A0001'
  };

  // --- NOTA PARA BACKEND: Este array debería venir de un GET /proyectos ---
  const proyectosDisponibles = ['Proyecto Alpha - ZF', 'Plataforma IMU-Halo', 'Validación HIL-2026', 'Testing Sensores'];

  const handleConfirmAction = () => {
    // PREPARACIÓN DE DATOS PARA EL BACKEND
    const payload = {
      activo_info: {
        id: activo.id,
        nombre: activo.nombre,
        marca: activo.marca
      },
      accion: showModal,
      detalles: showModal === 'asignar' ? { proyecto: proyectoAsignado } : { motivo: motivoMantenimiento },
      fecha_peticion: new Date().toISOString()
    };

    // --- NOTA PARA BACKEND: Aquí se hace el fetch(POST) enviando 'payload' ---
    console.log("Enviando al Back:", payload);

    // Limpiar campos y mostrar éxito
    setProyectoAsignado('');
    setMotivoMantenimiento('');
    setShowModal(null);
    setShowSuccess(true);
  };

  // 3. FUNCIONES DE RENDERIZADO
  const renderBotonesPorRol = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <button onClick={() => setShowModal('asignar')} className="w-full bg-[#0070BC] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
              <UserPlus size={20} /> Asignar equipo
            </button>
            <button onClick={() => setShowModal('mantenimiento')} className="w-full bg-[#0070BC] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
              <Wrench size={20} /> Reportar mantenimiento
            </button>
            <button onClick={() => setShowModal('baja')} className="w-full border-2 border-red-100 text-red-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Trash2 size={20} /> Dar de baja
            </button>
          </>
        );
      case 'user':
        return (
          <button onClick={() => setShowModal('solicitar')} className="w-full bg-[#0070BC] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <ClipboardList size={20} /> Solicitar activo
          </button>
        );
      case 'auditor':
        return (
          <button onClick={() => navigate(`/auditor/trazabilidad/${activo.id}`)} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
            <History size={20} /> Ver trazabilidad
          </button>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-24">
      <Navbar />
      <main className="p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-[#0070BC]"><ArrowLeft size={28} /></button>
          {userRole === 'admin' && (
            <button onClick={() => navigate(`/editar-activo/${activo.id}`)} className="border-2 border-[#0070BC] text-[#0070BC] px-6 py-1 rounded-full font-bold text-sm">Editar</button>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-48 h-32 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center text-gray-400 font-bold italic">Imagen Activo</div>
          <p className="text-gray-400 text-sm font-bold tracking-widest">ID: {activo.id}</p>
          <h2 className="text-2xl font-black text-gray-900 mt-2">{activo.nombre}</h2>
          <span className="bg-green-100 text-green-600 px-4 py-1 rounded-lg font-bold text-[10px] mt-2 uppercase tracking-wider">{activo.estado}</span>
        </div>

        <div className="bg-[#D1E9FF]/40 rounded-[25px] p-6 mt-8">
          <h3 className="text-[#0070BC] font-black mb-4 uppercase text-xs tracking-widest">Especificaciones:</h3>
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <p className="font-bold text-gray-500 uppercase">Modelo:</p> <p className="font-bold">{activo.modelo}</p>
            <p className="font-bold text-gray-500 uppercase">Categoría:</p> <p className="font-bold">{activo.categoria}</p>
            <p className="font-bold text-gray-500 uppercase">Ubicación:</p> <p className="font-bold">{activo.ubicacion}</p>
            <p className="font-bold text-gray-500 uppercase">Marca:</p> <p className="font-bold">{activo.marca}</p>
            <p className="font-bold text-gray-500 uppercase">Serie:</p> <p className="font-bold">{activo.serie}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          {renderBotonesPorRol()}
        </div>
      </main>

      {/* MODAL DINÁMICO (Asignar, Mantenimiento y Baja) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-sm rounded-[30px] p-8 animate-in zoom-in duration-200 shadow-2xl">
            <h2 className={`text-xl font-black mb-2 uppercase text-center ${showModal === 'baja' ? 'text-red-500' : 'text-[#0070BC]'}`}>
              {showModal === 'asignar' ? 'Asignar a Proyecto' : 
               showModal === 'mantenimiento' ? 'Reportar Mantenimiento' : 
               'Confirmar Baja'}
            </h2>
            <p className="text-gray-400 text-[10px] text-center mb-6 font-bold uppercase tracking-widest italic">
              ID Activo: {activo.id}
            </p>
            
            {/* 1. Caso: ASIGNAR */}
            {showModal === 'asignar' && (
              <div className="mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Seleccionar Proyecto:</label>
                <select 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 mt-1 outline-none focus:border-[#0070BC] font-bold text-gray-700"
                  value={proyectoAsignado}
                  onChange={(e) => setProyectoAsignado(e.target.value)}
                >
                  <option value="">-- Elige un proyecto --</option>
                  {proyectosDisponibles.map((proy, i) => (
                    <option key={i} value={proy}>{proy}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Caso: MANTENIMIENTO o BAJA */}
            {(showModal === 'mantenimiento' || showModal === 'baja') && (
              <div className="mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                  {showModal === 'mantenimiento' ? 'Motivo del reporte:' : 'Motivo de la baja:'}
                </label>
                <textarea 
                  className={`w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 mt-1 outline-none font-medium text-gray-700 resize-none transition-all ${showModal === 'baja' ? 'focus:border-red-400' : 'focus:border-orange-400'}`}
                  placeholder={showModal === 'mantenimiento' ? "Describe la falla técnica..." : "Explica por qué se retira el activo..."}
                  rows="4"
                  value={motivoMantenimiento} // Reutilizamos este estado para el texto
                  onChange={(e) => setMotivoMantenimiento(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setShowModal(null); setMotivoMantenimiento(''); }} className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleConfirmAction} 
                disabled={showModal === 'asignar' ? !proyectoAsignado : !motivoMantenimiento}
                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-all ${
                  (showModal === 'asignar' && !proyectoAsignado) || ((showModal === 'mantenimiento' || showModal === 'baja') && !motivoMantenimiento)
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : showModal === 'baja' ? 'bg-red-500 active:scale-95' : 'bg-[#0070BC] active:scale-95'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivoDetalle;