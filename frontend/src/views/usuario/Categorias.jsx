import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Monitor, FlaskConical, 
  Wrench, Car, Terminal, Smartphone, Ruler 
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const categorias = [
  { id: 1, nombre: 'Línea de producción', icon: <Settings size={32} />, path: '/activos' },
  { id: 2, nombre: 'Equipo de cómputo', icon: <Monitor size={32} />, path: '/activos' },
  { id: 3, nombre: 'Laboratorio', icon: <FlaskConical size={32} />, path: '/activos' },
  { id: 4, nombre: 'Refacciones', icon: <Wrench size={32} />, path: '/activos' },
  { id: 5, nombre: 'Automóvil', icon: <Car size={32} />, path: '/activos' },
  { id: 6, nombre: 'Sistemas', icon: <Terminal size={32} />, path: '/activos' },
  { id: 7, nombre: 'Equipo de comunicación', icon: <Smartphone size={32} />, path: '/activos' },
  { id: 8, nombre: 'Equipo de medición', icon: <Ruler size={32} />, path: '/activos' },
];

const Categorias = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />

      <header className="px-6 mt-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#0070BC] font-bold mb-4">
          <ArrowLeft size={20} className="mr-1" /> Volver
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 leading-none uppercase italic">Categorías</h1>
          <div className="w-16 h-1.5 bg-[#0070BC] mx-auto mt-2"></div>
        </div>
      </header>

      <main className="flex-1 px-6 mt-10">
        <div className="grid grid-cols-2 gap-4">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(cat.path)}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-[30px] bg-white shadow-sm hover:border-[#0070BC] hover:shadow-md transition-all active:scale-95"
            >
              <div className="text-gray-400 mb-3 p-3 bg-gray-50 rounded-2xl group-hover:text-[#0070BC]">
                {cat.icon}
              </div>
              <span className="text-[10px] font-black text-gray-800 uppercase text-center leading-tight tracking-wider">
                {cat.nombre}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Categorias;