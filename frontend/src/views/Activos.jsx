import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Plus, ArrowLeft, Loader2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const Activos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const queryBusqueda = searchParams.get('q') || ''; 
  const catId = location.state?.catId;
  const catNombre = location.state?.catNombre;
  const rolActivo = parseInt(localStorage.getItem('rol')) || 2; 

  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 NUEVO: Estados para la paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const categoriasTabs = ['Todos', 'En mantenimiento', 'Operativa', 'Prestada'];

  // Si el usuario cambia de filtro o busca algo nuevo, regresamos a la página 1
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, queryBusqueda, catId]);

  useEffect(() => {
    const fetchActivos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        const queryParms = new URLSearchParams();
        queryParms.append('page', paginaActual);
        queryParms.append('limit', 50); // Traemos de 50 en 50

        if (catId) queryParms.append('id_categoria', catId);
        if (rolActivo === 3) queryParms.append('mis_activos', 'true');
        if (queryBusqueda) queryParms.append('q', queryBusqueda);

        // Traducimos el texto del botón al ID de la base de datos
        if (filtroEstado !== 'Todos') {
          let estadoId = null;
          if (filtroEstado === 'Operativa') estadoId = 1;
          if (filtroEstado === 'En mantenimiento') estadoId = 2;
          if (filtroEstado === 'Prestada') estadoId = 3;
          if (estadoId) queryParms.append('id_estado_maquina', estadoId);
        }

        const url = `${baseUrl}/activos?${queryParms.toString()}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar inventario');

        const json = await response.json();
        
        const activosMapeados = json.data.map(item => ({
          id: item.id_activo.toString(),
          nombre: item.nombre_maquina,
          estado: item.estado_maquina?.nombre || 'Desconocido', 
          tipo: item.disciplina?.nombre || 'General', 
          color: getEstadoColor(item.id_estado_maquina),
        }));

        setActivos(activosMapeados);
        setTotalPaginas(json.meta.totalPaginas); // Guardamos el total de páginas
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivos();
  }, [catId, rolActivo, paginaActual, filtroEstado, queryBusqueda]);

  const getEstadoColor = (idEstado) => {
    switch (Number(idEstado)) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-red-100 text-red-700';
      case 3: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <header className="px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full text-[#0070BC] active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {(rolActivo === 1 || rolActivo === 3) && (
              <button onClick={() => navigate('/nuevo-activo')} className="p-3 bg-[#0070BC] rounded-2xl text-white shadow-lg active:scale-90 transition-transform">
                <Plus size={20} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">
          {catNombre || 'Inventario'} <br /> 
          <span className="text-[#0070BC]">{catNombre ? '' : 'General'}</span>
        </h1>
      </header>

      {/* FILTROS DE ESTADO */}
      <div className="flex gap-3 px-6 mt-8 overflow-x-auto no-scrollbar pb-2">
        {categoriasTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroEstado(cat)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap
              ${filtroEstado === cat 
                ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-xl shadow-blue-100' 
                : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-6 mt-6 overflow-y-auto pb-28">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
            <Loader2 className="animate-spin mb-4 text-[#0070BC]" size={40} />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Consultando Base de Datos...</p>
          </div>
        ) : error ? (
           <div className="text-center mt-20 text-red-500 font-bold">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activos.length > 0 ? (
              activos.map((activo) => (
                <Link 
                  key={activo.id} 
                  to={rolActivo === 7 || rolActivo === 3 ? `/auditor/trazabilidad/${activo.id}` : `/activo/${activo.id}`}
                  className="bg-white border-2 border-gray-50 rounded-[30px] p-5 shadow-sm active:scale-[0.98] transition-all group hover:border-blue-100 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="max-w-[70%]">
                      <p className="text-[9px] font-black text-[#0070BC] uppercase tracking-tighter mb-1">ID #{activo.id}</p>
                      <h3 className="font-black text-gray-900 text-lg leading-tight uppercase italic group-hover:text-[#0070BC] transition-colors line-clamp-1">
                        {activo.nombre}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">{activo.tipo}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${activo.color}`}>
                      {activo.estado}
                    </div>
                  </div>

                  {(rolActivo === 3 || rolActivo === 1) && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          navigate(`/editar-activo/${activo.id}`);
                        }}
                        className="flex items-center gap-2 bg-blue-50 text-[#0070BC] px-4 py-2 rounded-xl hover:bg-[#0070BC] hover:text-white transition-colors"
                      >
                        <Edit2 size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Editar Equipo</span>
                      </button>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="text-center py-20 opacity-30">
                <p className="font-black text-xl uppercase italic">Sin resultados</p>
                {queryBusqueda && <p className="text-xs mt-1">Buscando: "{queryBusqueda}"</p>}
              </div>
            )}

            {/* 🌟 CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="flex justify-between items-center mt-8 p-4 bg-gray-50 rounded-2xl">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-2 bg-white rounded-xl shadow-sm disabled:opacity-30 disabled:shadow-none text-[#0070BC] hover:bg-blue-50 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Página <span className="text-[#0070BC]">{paginaActual}</span> de {totalPaginas}
                </span>

                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-2 bg-white rounded-xl shadow-sm disabled:opacity-30 disabled:shadow-none text-[#0070BC] hover:bg-blue-50 transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Activos;