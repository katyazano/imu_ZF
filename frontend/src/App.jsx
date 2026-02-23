import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación de Vistas (Asegúrate de que los nombres de archivo coincidan)
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Activos from './views/Activos';
import AdminDashboard from './views/AdminDashboard';
import PrestamosActivos from './views/PrestamosActivos';
import ActivoDetalle from './views/ActivoDetalle';
import EditarActivo from './views/EditarActivo';
import NuevoActivo from './views/NuevoActivo';
import AdminMantenimiento from './views/AdminMantenimiento';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial: Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta principal: Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />

        {/* Rutas adicionales que definimos en el Navbar */}
        <Route path="/activos" element={<Activos/>} />
        <Route path="/prestamos-activos" element={<PrestamosActivos />} />

        {/* Rutas adicionales para activos */}
        <Route path="/activo/:id" element={<ActivoDetalle />} />
        <Route path="/editar-activo/:id" element={<EditarActivo />} />   
        <Route path="/nuevo-activo" element={<NuevoActivo />} />  
        <Route path="/admin-mantenimiento" element={<AdminMantenimiento />} />

        {/* Redirección por si el usuario entra a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;