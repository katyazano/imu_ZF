import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Aquí irá el catálogo de activos o las tarjetas de información */}
        <h2 className="text-2xl font-bold text-gray-800">Bienvenida de nuevo, Vanessa</h2>
        <p className="text-gray-600">Sistema de Gestión de Activos ZF</p>
        
        {/* Espacio para que el Bottom Bar no tape el contenido en móvil */}
        <div className="h-20 md:hidden"></div>
      </main>
    </div>
  );
};

export default Dashboard;