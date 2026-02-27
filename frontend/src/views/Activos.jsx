import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Plus, ArrowLeft, Loader2, Edit2 } from 'lucide-react'; // ✅ Agregamos Edit2
import Navbar from '../components/Navbar';

const Activos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchParams] = useSearchParams();
  const queryBusqueda = searchParams.get('q') || ''; 

  const catId = location.state?.catId;
  const catNombre = location.state?.catNombre;

  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const rolActivo = parseInt(localStorage.getItem('rol')) || 2; 

  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const categoriasTabs = ['Todos', 'Mantenimiento', 'Disponible', 'Prestado'];

  useEffect(() => {
    const fetchActivos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        let url = `${baseUrl}/activos`;
        const queryParms = new URLSearchParams();

        if (catId) queryParms.append('id_categoria', catId);
        // Si es Gerente (3), pedimos solo sus activos
        if (rolActivo === 3) queryParms.append('mis_activos', 'true');

        const queryString = queryParms.toString();
        if (queryString) url += `?${queryString}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar inventario');

        const data = await response.json();
        
        const activosMapeados = data.map(item => ({
          id: item.id_activo.toString(),
          nombre: item.nombre_maquina,
          estado: item.estado_maquina?.nombre || 'Desconocido', 
          tipo: item.disciplina?.nombre || 'General', 
          color: getEstadoColor(item.id_estado_maquina),
        }));

        setActivos(activosMapeados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivos();
  }, [catId, rolActivo]);

  const getEstadoColor = (idEstado) => {
    switch (idEstado) {
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-red-100 text-red-700';
      case 3: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const activosFiltrados = useMemo(() => {
    return activos.filter((activo) => {
      const coincideEstado = filtroEstado === 'Todos' || activo.estado === filtroEstado;
      const coincideBusqueda = 
        activo.nombre.toLowerCase().includes(queryBusqueda.toLowerCase()) || 
        activo.id.includes(queryBusqueda);
      return coincideEstado && coincideBusqueda;
    });
  }, [filtroEstado, queryBusqueda, activos]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <header className="px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full text-[#0070BC] active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {/* El Admin y el Gerente pueden agregar activos nuevos */}
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
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Actualizando ZF Assets...</p>
          </div>
        ) : error ? (
           <div className="text-center mt-20 text-red-500 font-bold">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activosFiltrados.length > 0 ? (
              activosFiltrados.map((activo) => (
                <Link 
                  key={activo.id} 
                  to={
                    rolActivo === 7 || rolActivo === 3 ? `/auditor/trazabilidad/${activo.id}` : 
                    `/activo/${activo.id}`
                  }
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

                  {/* ✅ BOTÓN DE EDICIÓN EXCLUSIVO PARA GERENTES (Y ADMINS) */}
                  {(rolActivo === 3 || rolActivo === 1) && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); // Evita que se abra el detalle/trazabilidad
                          e.stopPropagation(); // Detiene el clic de afectar a la tarjeta principal
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Activos;