import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, X, ChevronRight, 
  Users, ShieldCheck, CheckCircle, Info, User 
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const GestionarFirmas = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [subVista, setSubVista] = useState('principal'); 
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  // --- ESTADO PARA SELECCIÓN MÚLTIPLE ---
  const [aprobadoresSeleccionados, setAprobadoresSeleccionados] = useState([]);

  const solicitudesMock = [
    { id: '100002', codigo: 'EQP-ADAS-0001', solicitante: 'Ana García', destino: 'Universidad Tecmilenio' },
    { id: '100005', codigo: 'EQP-ADAS-0002', solicitante: 'Carlos Ruiz', destino: 'Planta ZF Toluca' },
  ];

  const personalAutorizado = [
    { id: 'G-01', nombre: 'Roberto Torres', rol: 'Gerente', area: 'Producción' },
    { id: 'G-02', nombre: 'Marcos Díaz', rol: 'Gerente', area: 'Logística' },
    { id: 'E-01', nombre: 'Elena Sosa', rol: 'EHS', area: 'Seguridad' },
    { id: 'E-02', nombre: 'Ricardo Slim', rol: 'EHS', area: 'Calidad' },
  ];

  // Función para agregar/quitar aprobadores de la lista (Borde verde)
  const toggleAprobador = (usuario) => {
    setAprobadoresSeleccionados(prev => {
      const yaSeleccionado = prev.find(u => u.id === usuario.id);
      if (yaSeleccionado) {
        return prev.filter(u => u.id !== usuario.id); 
      } else {
        return [...prev, usuario]; 
      }
    });
  };

  const handleConfirmarRegla = () => {
    // --- NOTA PARA BACKEND: Aquí reciben el array completo de aprobadores ---
    const payload = {
      solicitud_id: '100002', // Aquí iría el ID real de la solicitud seleccionada
      aprobadores: aprobadoresSeleccionados.map(u => ({ id: u.id, rol: u.rol })),
      fecha_configuracion: new Date().toISOString()
    };

    console.log("Enviando a BD para crear Regla de Negocio:", payload);
    
    // Resetear y cerrar
    setShowModal(false);
    setAprobadoresSeleccionados([]);
    setSubVista('principal');
    setBusquedaUsuario('');
  };

  const resultadosBusqueda = personalAutorizado.filter((usuario) => {
    const term = busquedaUsuario.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(term) || 
      usuario.area.toLowerCase().includes(term) ||
      usuario.rol.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white hover:scale-110 transition-transform">
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">Gestionar firmas</h1>
      </div>

      <main className="px-6 -mt-12 flex-1">
        <div className="flex flex-col gap-6">
          {solicitudesMock.map((sol) => (
            <div key={sol.id} className="bg-white border-2 border-gray-100 rounded-[30px] p-6 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-none">{sol.codigo}</h3>
                  <p className="text-[10px] font-black text-gray-400 mt-2 uppercase">ID: {sol.id}</p>
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <p className="text-sm font-bold text-gray-700">
                  <span className="text-gray-400 uppercase text-[10px] mr-1">Solicitante:</span> {sol.solicitante}
                </p>
                <p className="text-sm font-bold text-gray-700">
                  <span className="text-gray-400 uppercase text-[10px] mr-1">Destino:</span> {sol.destino}
                </p>
              </div>

              <button 
                onClick={() => setShowModal(true)}
                className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
              >
                Asignar aprobadores
              </button>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 animate-in zoom-in duration-300 relative max-h-[85vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              {subVista !== 'principal' && (
                <button onClick={() => {setSubVista('principal'); setBusquedaUsuario('');}} className="text-[#0070BC] font-bold text-xs uppercase flex items-center gap-1">
                  <ArrowLeft size={14} /> Volver
                </button>
              )}
              <h3 className="text-lg font-black text-gray-900 uppercase">
                {subVista === 'principal' ? 'Configurar Regla' : subVista === 'lista-gerentes' ? 'Lista Gerentes' : subVista === 'lista-ehs' ? 'Lista EHS' : 'Resultados'}
              </h3>
              <button onClick={() => { setShowModal(false); setSubVista('principal'); setBusquedaUsuario(''); setAprobadoresSeleccionados([]); }} className="p-2 bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* BUSCADOR */}
            <div className="bg-gray-100 rounded-2xl flex items-center px-4 py-3 mb-6 focus-within:ring-2 focus-within:ring-[#0070BC] transition-all">
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o área..."
                className="bg-transparent border-none outline-none w-full font-bold text-sm text-gray-800"
                value={busquedaUsuario}
                onChange={(e) => {
                  setBusquedaUsuario(e.target.value);
                  if (e.target.value.length > 0) setSubVista('busqueda');
                  else setSubVista('principal');
                }}
              />
              {busquedaUsuario && (
                <X size={16} className="text-gray-400 cursor-pointer" onClick={() => { setBusquedaUsuario(''); setSubVista('principal'); }} />
              )}
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {subVista === 'principal' && (
                <div className="animate-in fade-in duration-300">
                  <div className="relative mb-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Categoría del activo:</label>
                    <div className="relative">
                      <select className="w-full bg-gray-100 border-none rounded-2xl p-4 font-bold text-gray-700 appearance-none outline-none">
                        <option>Línea de producción</option>
                        <option>Laboratorio</option>
                        <option>Refacciones</option>
                      </select>
                      <ChevronRight size={20} className="absolute right-4 top-4 rotate-90 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <p className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest mb-3">Selección rápida por rol:</p>
                  <div className="space-y-3 mb-6">
                    <button onClick={() => setSubVista('lista-gerentes')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#0070BC] transition-all">
                      <div className="flex items-center gap-3">
                        <Users size={20} className="text-[#0070BC]" />
                        <span className="font-bold text-gray-700">Todos los Gerentes</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                    <button onClick={() => setSubVista('lista-ehs')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#0070BC] transition-all">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-[#0070BC]" />
                        <span className="font-bold text-gray-700">Todos los EHS</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  </div>
                </div>
              )}

              {subVista !== 'principal' && (
                <div className="space-y-3 animate-in slide-in-from-right duration-300">
                  {(subVista === 'busqueda' ? resultadosBusqueda : personalAutorizado.filter(u => 
                    subVista === 'lista-gerentes' ? u.rol === 'Gerente' : u.rol === 'EHS'
                  )).map((usuario) => {
                    const isSelected = aprobadoresSeleccionados.some(u => u.id === usuario.id);
                    return (
                      <button 
                        key={usuario.id}
                        onClick={() => toggleAprobador(usuario)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected ? 'border-green-500 bg-green-50 shadow-sm' : 'border-transparent bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${isSelected ? 'bg-green-500 text-white' : 'bg-white text-gray-400'}`}>
                          <User size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-gray-900 text-sm leading-none">{usuario.nombre}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{usuario.area}</p>
                            <span className="text-[8px] font-black bg-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase">{usuario.rol}</span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle size={18} className="text-green-500" />}
                      </button>
                    );
                  })}
                  {subVista === 'busqueda' && resultadosBusqueda.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 font-bold text-xs uppercase italic">No se encontraron usuarios</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PIE DEL MODAL (BOTONES FIJOS) */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">Aprobadores:</span>
                <span className="bg-[#0070BC] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{aprobadoresSeleccionados.length}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowModal(false); setSubVista('principal'); setAprobadoresSeleccionados([]); }}
                  className="flex-1 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmarRegla}
                  disabled={aprobadoresSeleccionados.length === 0}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all ${
                    aprobadoresSeleccionados.length > 0 ? 'bg-[#0070BC] text-white shadow-blue-100' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarFirmas;