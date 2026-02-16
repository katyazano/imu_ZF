import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación de Vistas (Asegúrate de que los nombres de archivo coincidan)
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Activos from './views/Activos';

// Podrás ir creando estas vistas después
const Catalogo = () => <div className="p-20"><h2>Pantalla de Catálogo (En construcción)</h2></div>;
const Prestamos = () => <div className="p-20"><h2>Pantalla de Préstamos (En construcción)</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial: Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta principal: Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rutas adicionales que definimos en el Navbar */}
        <Route path="/activos" element={<Activos/>} />
        <Route path="/prestamos" element={<Prestamos />} />

        {/* Redirección por si el usuario entra a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;