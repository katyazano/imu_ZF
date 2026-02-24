import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Plus, ArrowLeft, Search, Camera, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const activosMock = [
  { id: '100001', nombre: 'BetaWorks Serie X300', estado: 'Disponible', color: 'bg-green-200 text-green-700', tipo: 'Herramienta' },
  { id: '100023', nombre: 'Epsilon Systems RAD-77G', estado: 'Prestado', color: 'bg-orange-200 text-orange-700', tipo: 'Especializado' },
  { id: '100005', nombre: 'GammaTech Modelo B1', estado: 'Disponible', color: 'bg-green-200 text-green-700', tipo: 'Laptop' },
  { id: '100028', nombre: 'BetaWorks HIL-1000', estado: 'Mantenimiento', color: 'bg-red-200 text-red-700', tipo: 'Herramienta' },
];

const Activos = () => {
  const navigate = useNavigate();
  const [userRole] = useState('user'); //AQUI SE PUEDE CAMBIAR EL ROL 'user' o 'admin'
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos'); // Nuevo filtro técnico
  const [busqueda, setBusqueda] = useState('');
  const [isMenuFiltrosOpen, setIsMenuFiltrosOpen] = useState(false);

  const categorias = ['Todos', 'Mantenimiento', 'Disponible', 'Prestado'];
  

  // Estados para Filtros Técnicos
  const [filtrosTecnicos, setFiltrosTecnicos] = useState({
    categoria: 'Todos',
    area: 'Todos',
    subarea: 'Todos',
    marca: 'Todos',
    anio: 'Todos'
  });


  // --- LÓGICA DE FILTRADO FUNCIONAL ---
  const activosFiltrados = useMemo(() => {
    return activosMock.filter((activo) => {
      const coincideEstado = filtroEstado === 'Todos' || activo.estado === filtroEstado;
      const coincideBusqueda = activo.nombre.toLowerCase().includes(busqueda.toLowerCase()) || activo.id.includes(busqueda);
      
      // Filtros técnicos avanzados
      const coincideCat = filtrosTecnicos.categoria === 'Todos' || activo.categoria === filtrosTecnicos.categoria;
      const coincideArea = filtrosTecnicos.area === 'Todos' || activo.area === filtrosTecnicos.area;
      const coincideSub = filtrosTecnicos.subarea === 'Todos' || activo.subarea === filtrosTecnicos.subarea;
      const coincideMarca = filtrosTecnicos.marca === 'Todos' || activo.marca === filtrosTecnicos.marca;
      const coincideAnio = filtrosTecnicos.anio === 'Todos' || activo.anio === filtrosTecnicos.anio;

      return coincideEstado && coincideBusqueda && coincideCat && coincideArea && coincideSub && coincideMarca && coincideAnio;
    });
  }, [filtroEstado, busqueda, filtrosTecnicos]);

  const handleFiltroChange = (campo, valor) => {
    setFiltrosTecnicos(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <header className="px-6 mt-8 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#0070BC] font-bold">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 leading-none">Activos</h1>
          <div className="w-16 h-1.5 bg-[#0070BC] mx-auto mt-1"></div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsMenuFiltrosOpen(true)} 
            className={`p-2 rounded-full transition-transform active:scale-90 ${filtroTipo !== 'Todos' ? 'bg-[#0070BC] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <Filter size={24} />
          </button>
          {userRole === 'admin' && (
            <button onClick={() => navigate('/nuevo-activo')} className="p-2 bg-[#0070BC] rounded-full text-white shadow-lg active:scale-90 transition-transform">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>

      {/* Filtros Rápidos (Estado) */}
      <div className="flex gap-3 px-6 mt-6 overflow-x-auto no-scrollbar pb-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroEstado(cat)}
            className={`px-6 py-2 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all
              ${filtroEstado === cat ? 'bg-[#0070BC] border-[#0070BC] text-white' : 'bg-white border-gray-200 text-gray-500'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="flex-1 px-6 mt-4 overflow-y-auto pb-28">
        <div className="flex flex-col gap-5">
          {activosFiltrados.length > 0 ? (
            activosFiltrados.map((activo, index) => (
              <div key={index} className="border-2 border-gray-100 rounded-[25px] p-5 flex flex-col relative shadow-sm bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Link to={`/activo/${activo.id}`} className="block">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-3/4">
                      <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{activo.nombre}</h3>
                      <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest italic">TIPO: {activo.tipo} | ID: {activo.id}</p>
                    </div>
                  </div>
                  <div className={`w-fit px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${activo.color}`}>
                    {activo.estado}
                  </div>
                </Link>
                {userRole === 'admin' && (
                  <button 
                    onClick={() => navigate(`/editar-activo/${activo.id}`)}
                    className="absolute bottom-5 right-6 text-[#0070BC] font-black text-xs uppercase hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center mt-20">
              <p className="text-gray-300 font-black text-xl uppercase tracking-widest">Sin resultados</p>
              <button onClick={() => {setFiltroEstado('Todos'); setFiltroTipo('Todos'); setBusqueda('');}} className="text-[#0070BC] font-bold mt-2 underline">Limpiar filtros</button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE FILTROS TÉCNICOS AVANZADOS */}
      {isMenuFiltrosOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic">Filtros Avanzados</h2>
              <button onClick={() => setIsMenuFiltrosOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Categoría', key: 'categoria', options: ['Todos', 'Maquinaria', 'Electrónica', 'Mobiliario'] },
                { label: 'Área', key: 'area', options: ['Todos', 'Producción', 'Validación', 'Logística'] },
                { label: 'Marca', key: 'marca', options: ['Todos', 'BetaWorks', 'Epsilon', 'GammaTech'] },
                { label: 'Año', key: 'anio', options: ['Todos', '2022', '2023', '2024', '2025'] }
              ].map((group) => (
                <div key={group.key}>
                  <p className="font-black text-[10px] text-gray-400 uppercase mb-3 tracking-widest">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => handleFiltroChange(group.key, opt)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${filtrosTecnicos[group.key] === opt ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setIsMenuFiltrosOpen(false)} className="w-full mt-10 bg-[#0070BC] text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest active:scale-95 transition-transform">Ver {activosFiltrados.length} Resultados</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activos;