import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Clock, ChevronRight, User, Loader2, 
  AlertCircle, History, ChevronLeft, Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';

const PrestamosActivos = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estatusFiltro = searchParams.get('estatus') || 'Todos';

  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ESTADOS PARA PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const rolActivo = parseInt(localStorage.getItem('rol')) || 2;

  // 🔄 OPCIONES DE FILTRO ACTUALIZADAS
  const opcionesFiltro = [
    { label: 'Todos', valor: 'Todos' },
    { label: 'Vencidos', valor: 'Vencido' },
    { label: 'Pendientes', valor: 'Pendiente' }, // 👈 Nuevo filtro agregado
    { label: 'Aprobados', valor: 'Aprobada' },
    { label: 'En Tránsito', valor: 'En Tránsito' }
  ];

  useEffect(() => {
    setPaginaActual(1);
  }, [estatusFiltro]);

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

        let url = `${baseUrl}/solicitudes/master?page=${paginaActual}&limit=10`;
        if (estatusFiltro && estatusFiltro !== 'Todos') {
          url += `&estatus=${estatusFiltro}`;
        }

        const response = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Error al conectar con el servidor');
        const result = await response.json();
        
        const listaReal = result.data || [];
        if (result.paginacion) {
          setTotalPaginas(result.paginacion.total_paginas);
        }

        const prestamosMapeados = listaReal.map(sol => ({
          id_solicitud: sol.id_solicitud,
          id_activo: sol.id_activo || sol.activo?.id_activo,
          nombre_activo: sol.activo?.nombre_maquina || 'Equipo ZF',
          nombre_solicitante: sol.solicitante?.nombre_completo || 'Personal ZF',
          fecha_salida: new Date(sol.fecha_creacion).toLocaleDateString(),
          tag: sol.activo?.tag || sol.activo?.qr_codigo || 'S/N',
          estatus: sol.estatus_general
        }));

        setPrestamos(prestamosMapeados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, [paginaActual, estatusFiltro]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <header className="p-8 pt-12">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-gray-50 rounded-full text-[#0070BC] mb-6 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-2">
            <History size={20} className="text-[#0070BC]" />
            <p className="text-[10px] font-black text-[#0070BC] uppercase tracking-[0.3em] italic">Control de Movimientos</p>
        </div>
        <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight mb-8">
          Historial <br />
          <span className="text-[#0070BC]">Préstamos</span>
        </h1>

        {/* 🔘 BARRA DE FILTROS RÁPIDOS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {opcionesFiltro.map((f) => (
            <button
              key={f.valor}
              onClick={() => navigate(f.valor === 'Todos' ? '/prestamos-activos' : `/prestamos-activos?estatus=${f.valor}`)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                estatusFiltro === f.valor
                  ? 'bg-[#0070BC] border-[#0070BC] text-white shadow-lg shadow-blue-100 scale-105'
                  : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-5 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Sincronizando...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-8 rounded-[40px] text-center border-2 border-red-100">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-red-600 font-black text-xs uppercase italic">{error}</p>
          </div>
        ) : prestamos.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {prestamos.map((p) => (
                <div 
                  key={p.id_solicitud} 
                  onClick={() => {
                    if (p.id_activo && [1, 3, 7].includes(rolActivo)) {
                        navigate(`/auditor/trazabilidad/${p.id_activo}`);
                    } else {
                        navigate(`/solicitud/${p.id_solicitud}`);
                    }
                  }}
                  className="group bg-white p-6 rounded-[40px] border-2 border-gray-50 shadow-sm active:scale-[0.98] transition-all hover:border-blue-100 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black bg-blue-50 text-[#0070BC] px-3 py-1 rounded-full uppercase tracking-widest">
                        Folio #{p.id_solicitud}
                      </span>
                      
                      {/* 🔄 LÓGICA DE COLOR REFORZADA */}
                      <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                          p.estatus === 'Aprobada' || p.estatus === 'En Tránsito' 
                          ? 'bg-green-50 text-green-600'
                          : p.estatus === 'Vencido' // Nuevo: Color rojo para vencidos
                          ? 'bg-red-50 text-red-600'
                          : p.estatus === 'Pendiente'
                          ? 'bg-orange-50 text-orange-600' // 👈 Color para Pendientes
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                          {p.estatus}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-gray-900 text-lg uppercase italic group-hover:text-[#0070BC] transition-colors leading-tight line-clamp-1">
                      {p.nombre_activo}
                    </h3>

                    <div className="flex items-center gap-2 mt-3 text-gray-500">
                      <div className="bg-gray-50 p-1.5 rounded-lg text-[#0070BC]">
                        <User size={12} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Portador: <span className="text-gray-900">{p.nombre_solicitante}</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-[22px] bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0070BC] group-hover:text-white transition-all shadow-inner">
                    <ChevronRight size={22} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 pb-10">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(prev => prev - 1)}
                className="p-4 bg-gray-50 rounded-2xl text-[#0070BC] disabled:opacity-30"
              >
                <ChevronLeft size={24} />
              </button>
              
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Página <span className="text-[#0070BC]">{paginaActual}</span> de {totalPaginas}
              </span>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(prev => prev + 1)}
                className="p-4 bg-gray-50 rounded-2xl text-[#0070BC] disabled:opacity-30"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="font-black text-gray-400 uppercase italic tracking-widest text-xs px-10">
              No hay registros con el estatus "{estatusFiltro}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PrestamosActivos;