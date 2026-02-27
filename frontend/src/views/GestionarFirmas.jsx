import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, X, ChevronRight, 
  Users, ShieldCheck, CheckCircle, User, Loader2 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const GestionarFirmas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subVista, setSubVista] = useState('principal'); 
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  // --- ESTADOS PARA DATOS REALES ---
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [aprobadoresSeleccionados, setAprobadoresSeleccionados] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        // 1. Traer categorías para asignarles reglas
        const resCat = await fetch(`${baseUrl}/catalogos/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // 2. Traer usuarios con roles de Gerente (3) o EHS (5)
        const resUser = await fetch(`${baseUrl}/usuarios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resCat.ok && resUser.ok) {
          setCategorias(await resCat.json());
          setUsuarios(await resUser.json());
        }
      } catch (error) {
        console.error("Error al cargar datos de configuración:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleAprobador = (usuario) => {
    setAprobadoresSeleccionados(prev => {
      const yaSeleccionado = prev.find(u => u.id_usuario === usuario.id_usuario);
      return yaSeleccionado 
        ? prev.filter(u => u.id_usuario !== usuario.id_usuario) 
        : [...prev, usuario];
    });
  };

  const handleConfirmarRegla = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const payload = {
        id_categoria: categoriaSeleccionada.id_categoria,
        aprobadores: aprobadoresSeleccionados.map(u => u.id_usuario)
      };

      const res = await fetch(`${baseUrl}/reglas-aprobacion`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setAprobadoresSeleccionados([]);
        alert("Regla de aprobación actualizada correctamente");
      }
    } catch (e) { console.error(e); }
  };

  const resultadosBusqueda = usuarios.filter((u) => 
    u.nombre_completo.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Reglas de Negocio</h1>
      </div>

      <main className="px-6 -mt-12 flex-1">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0070BC]" size={40} /></div>
        ) : (
          <div className="flex flex-col gap-4">
            {categorias.map((cat) => (
              <div key={cat.id_categoria} className="bg-white border-2 border-gray-100 rounded-[30px] p-6 shadow-xl shadow-blue-900/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-gray-900 uppercase italic">{cat.nombre}</h3>
                  <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-400">ID: {cat.id_categoria}</span>
                </div>
                
                <button 
                  onClick={() => { setCategoriaSeleccionada(cat); setShowModal(true); }}
                  className="w-full bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-200"
                >
                  Asignar Firmas
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL CONFIGURADOR */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 uppercase">
                {subVista === 'principal' ? 'Configurar Regla' : 'Seleccionar'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* BUSCADOR */}
            <div className="bg-gray-100 rounded-2xl flex items-center px-4 py-3 mb-6">
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar por nombre..."
                className="bg-transparent border-none outline-none w-full font-bold text-sm text-gray-800"
                value={busquedaUsuario}
                onChange={(e) => {
                  setBusquedaUsuario(e.target.value);
                  setSubVista(e.target.value.length > 0 ? 'busqueda' : 'principal');
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {(subVista === 'principal' ? usuarios : resultadosBusqueda).map((user) => {
                const isSelected = aprobadoresSeleccionados.some(u => u.id_usuario === user.id_usuario);
                return (
                  <button 
                    key={user.id_usuario}
                    onClick={() => toggleAprobador(user)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected ? 'border-green-500 bg-green-50' : 'border-transparent bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isSelected ? 'bg-green-500 text-white' : 'bg-white text-gray-400'}`}>
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-800 text-sm uppercase">{user.nombre_completo}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase italic">ID: {user.id_usuario}</p>
                    </div>
                    {isSelected && <CheckCircle size={18} className="text-green-500" />}
                  </button>
                );
              })}
            </div>

            {/* PIE DEL MODAL */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs">Cancelar</button>
              <button 
                onClick={handleConfirmarRegla}
                disabled={aprobadoresSeleccionados.length === 0}
                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest ${
                  aprobadoresSeleccionados.length > 0 ? 'bg-[#0070BC] text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-300'
                }`}
              >
                Confirmar ({aprobadoresSeleccionados.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarFirmas;