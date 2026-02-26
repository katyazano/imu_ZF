import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Plus, ArrowLeft, Loader2, Search } from 'lucide-react';
import Navbar from '../components/Navbar';

const Activos = () => {
  const navigate = useNavigate();
  
  // Estados de datos
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. 🧠 LÓGICA DE ROLES MEJORADA
  // Leemos el rol exacto (1: Admin, 2: Gerente, 3: Usuario, 7: Auditor)
  const rolActivo = parseInt(localStorage.getItem('rol')) || 3; 

  // Estados de filtros
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [isMenuFiltrosOpen, setIsMenuFiltrosOpen] = useState(false);

  const categorias = ['Todos', 'Mantenimiento', 'Disponible', 'Prestado'];

  // ==========================================
  // CARGAR DATOS DESDE EL BACKEND
  // ==========================================
  useEffect(() => {
    const fetchActivos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:4000/api/activos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('No se pudieron cargar los activos');

        const data = await response.json();
        
        const activosMapeados = data.map(item => ({
          id: item.id_activo.toString(),
          nombre: item.nombre_maquina,
          estado: item.estado_maquina?.nombre || 'Desconocido',
          color: getEstadoColor(item.id_estado_maquina),
          tipo: item.disciplina?.nombre || 'General',
          qr: item.qr_codigo
        }));

        setActivos(activosMapeados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivos();
  }, []);

  const getEstadoColor = (idEstado) => {
    switch (idEstado) {
      case 1: return 'bg-green-100 text-green-700';    // Disponible
      case 2: return 'bg-red-100 text-red-700';        // Mantenimiento
      case 3: return 'bg-orange-100 text-orange-700';  // Prestado
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ==========================================
  // LÓGICA DE FILTRADO
  // ==========================================
  const activosFiltrados = useMemo(() => {
    return activos.filter((activo) => {
      const coincideEstado = filtroEstado === 'Todos' || activo.estado === filtroEstado;
      const coincideBusqueda = 
        activo.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        activo.id.includes(busqueda);
      return coincideEstado && coincideBusqueda;
    });
  }, [filtroEstado, busqueda, activos]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <header className="px-6 mt-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#0070BC] font-bold active:scale-95 transition-transform">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 leading-none">Activos</h1>
          <div className="w-16 h-1.5 bg-[#0070BC] mx-auto mt-1 rounded-full"></div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsMenuFiltrosOpen(!isMenuFiltrosOpen)} 
            className="p-2 rounded-full bg-gray-100 text-gray-600 active:scale-90 transition-transform"
          >
            <Filter size={24} />
          </button>
          
          {/* Solo el Admin (Rol 1) puede agregar nuevos activos */}
          {rolActivo === 1 && (
            <button onClick={() => navigate('/nuevo-activo')} className="p-2 bg-[#0070BC] rounded-full text-white shadow-lg active:scale-90 transition-transform">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>

      {/* Buscador de Activos */}
      <div className="px-6 mt-6">
        <div className="relative flex items-center group">
          <Search size={20} className="absolute left-4 text-gray-400 group-focus-within:text-[#0070BC] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID..."
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 px-12 outline-none focus:border-blue-200 focus:bg-white transition-all text-sm font-bold text-gray-700 placeholder:text-gray-400 shadow-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros Rápidos (Estado) */}
      <div className="flex gap-3 px-6 mt-6 overflow-x-auto no-scrollbar pb-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroEstado(cat)}
            className={`px-6 py-2 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all active:scale-95
              ${filtroEstado === cat ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-6 mt-4 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <Loader2 className="animate-spin mb-2" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Cargando inventario...</p>
          </div>
        ) : error ? (
            <div className="text-center mt-20 bg-red-50 p-6 rounded-[30px] border border-red-100">
                <p className="text-red-500 font-bold italic">{error}</p>
                <button onClick={() => window.location.reload()} className="text-red-700 font-black uppercase tracking-widest text-[10px] mt-3 bg-red-100 px-4 py-2 rounded-full">Reintentar</button>
            </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activosFiltrados.length > 0 ? (
              activosFiltrados.map((activo, index) => (
                <div key={index} className="border-2 border-gray-50 hover:border-blue-100 rounded-[25px] p-5 flex flex-col relative shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors group">
                  
                  {/* 2. 🔀 RUTEO DINÁMICO (DRILL-DOWN) */}
                  {/* Si el rol es 7 (Auditor), el enlace apunta a trazabilidad. Si no, a la ficha normal */}
                  <Link 
                    to={rolActivo === 7 ? `/auditor/trazabilidad/${activo.id}` : `/activo/${activo.id}`} 
                    className="block"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-3/4">
                        <h3 className="font-extrabold text-gray-900 text-xl leading-tight group-hover:text-[#0070BC] transition-colors">{activo.nombre}</h3>
                        <p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-widest">TIPO: {activo.tipo} | ID: {activo.id}</p>
                      </div>
                    </div>
                    <div className={`w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${activo.color}`}>
                      {activo.estado}
                    </div>
                  </Link>

                  {/* Solo el Admin (Rol 1) puede ver el botón de editar */}
                  {rolActivo === 1 && (
                    <button 
                      onClick={() => navigate(`/editar-activo/${activo.id}`)}
                      className="absolute bottom-5 right-6 text-[#0070BC] font-black text-[10px] tracking-widest uppercase hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center mt-20">
                <p className="text-gray-300 font-black text-xl uppercase tracking-widest">Sin resultados</p>
                <button onClick={() => {setFiltroEstado('Todos'); setBusqueda('');}} className="text-[#0070BC] text-sm font-bold mt-2 hover:underline">Limpiar filtros</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Activos;