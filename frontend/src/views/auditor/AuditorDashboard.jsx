import React, { useState } from 'react';
import { 
  FileText, Download, Sparkles, TrendingUp, 
  Package, Info, AlertTriangle, ChevronRight, History
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// --- MOCK DATA ---
const dataStock = [
  { name: 'Almacen A', stock: 450 },
  { name: 'Almacen B', stock: 247 },
  { name: 'Almacen C', stock: 180 },
];

const dataEstado = [
  { name: 'ACTIVO', value: 70, color: '#0070BC' },
  { name: 'MANTENIMIENTO', value: 20, color: '#28B4AD' },
  { name: 'BAJA', value: 10, color: '#E5E7EB' },
];

const dataMantenimiento = [
  { month: 'Ene', mant: 5 }, { month: 'Feb', mant: 8 },
  { month: 'Mar', mant: 15 }, { month: 'Abr', mant: 10 },
  { month: 'May', mant: 12 }, { month: 'Jun', mant: 18 },
];

const AuditorDashboard = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('7d');

  return (
    /* h-screen y overflow-y-auto controlan que el scroll sea interno y no mueva el Navbar */
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* CONTENEDOR CON SCROLL PROPIO */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Header Azul ZF - Solo Título e Info */}
        <div className="bg-[#0070BC] p-6 pt-10 pb-16 shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Auditor</h1>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Dashboard</h1>
            </div>
            <div className="bg-white/10 p-2 rounded-full text-white border border-white/20">
              <Info size={24} />
            </div>
          </div>

          {/* Filtros de Tiempo Estilo Pill */}
          <div className="flex gap-2 bg-black/10 p-1.5 rounded-2xl backdrop-blur-sm">
            {['Hoy', '7d', '30d'].map((t) => (
              <button 
                key={t}
                onClick={() => setPeriodo(t)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all duration-300 ${
                  periodo === t ? 'bg-[#28B4AD] text-white shadow-lg' : 'text-white/50 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENIDO DE GRÁFICOS */}
        <main className="px-6 -mt-8 flex flex-col gap-6 pb-40"> {/* pb-40 es vital para que el Navbar no tape nada */}
          
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100">
              <p className="text-[8px] font-black text-[#0070BC] uppercase tracking-widest mb-1">Total</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">1,280</h3>
            </div>
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 border-b-4 border-b-[#28B4AD]">
              <p className="text-[8px] font-black text-[#28B4AD] uppercase tracking-widest mb-1">Préstamo</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">12</h3>
            </div>
            <div className="bg-white p-4 rounded-[25px] shadow-sm border border-gray-100 border-b-4 border-b-red-400">
              <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Alertas</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">12</h3>
            </div>
          </div>

          {/* IA INSIGHTS */}
          <div className="bg-gradient-to-br from-[#0070BC] to-[#28B4AD] p-6 rounded-[35px] shadow-xl text-white relative overflow-hidden group">
            <Sparkles className="absolute right-[-10px] top-[-10px] text-white/20" size={100} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} />
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em]">IA Insights</h4>
              </div>
              <p className="text-[11px] font-bold leading-relaxed opacity-95 italic">
                "Alta probabilidad de desabasto en **Línea de producción A** para la próxima semana. Sugerimos reasignar activos."
              </p>
            </div>
          </div>

          {/* ACCIONES RÁPIDAS */}
            <div className="px-1 flex flex-col gap-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Acciones Rápidas</p>
              
              <button 
                onClick={() => navigate('/auditor/busqueda')} 
                className="w-full bg-white border-2 border-gray-100 p-5 rounded-[30px] flex items-center justify-between hover:border-[#0070BC] transition-all shadow-sm active:scale-95"
              >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <History size={24} className="text-[#0070BC]" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-sm text-gray-900 leading-none">Búsqueda Rápida</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Consultar trazabilidad por ID</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          </div>

          {/* STOCK POR ALMACÉN */}
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
            <h4 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-widest flex items-center gap-2">
               Stock por almacen
            </h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dataStock} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#9ca3af'}} width={70} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="stock" fill="#0070BC" radius={[0, 10, 10, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ESTADO GENERAL CON BOTONES PDF/EXCEL */}
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Estado General</h4>
              <div className="flex gap-2">
                <button className="p-2 bg-red-50 text-red-500 rounded-lg"><FileText size={16} /></button>
                <button className="p-2 bg-green-50 text-green-500 rounded-lg"><Download size={16} /></button>
              </div>
            </div>
            
            <div className="flex items-center">
              <ResponsiveContainer width="55%" height={150}>
                <PieChart>
                  <Pie data={dataEstado} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                    {dataEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-2">
                {dataEstado.map(e => (
                  <div key={e.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: e.color}}></div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tight">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HISTORIAL MANTENIMIENTO */}
          <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
            <h4 className="font-black text-gray-900 mb-6 uppercase text-[10px] tracking-widest">Mantenimientos</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={dataMantenimiento}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#9ca3af'}} />
                <Tooltip />
                <Line type="monotone" dataKey="mant" stroke="#28B4AD" strokeWidth={3} dot={{ r: 3, fill: '#28B4AD' }} />
              </LineChart>
            </ResponsiveContainer>
           </div>


        </main>
      </div>
    </div>
  );
};

export default AuditorDashboard;