import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación de Vistas 
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Activos from './views/Activos';
import AdminDashboard from './views/admin/AdminDashboard';
import PrestamosActivos from './views/PrestamosActivos';
import ActivoDetalle from './views/ActivoDetalle';
import EditarActivo from './views/admin/EditarActivo';
import NuevoActivo from './views/admin/NuevoActivo';
import AdminMantenimiento from './views/admin/AdminMantenimiento';
import Notificaciones from './views/Notificaciones';
import Perfil from './views/Perfil';
import GestionarFirmas from './views/admin/GestionarFirmas';
import AuditorDashboard from './views/auditor/AuditorDashboard';
import Trazabilidad from './views/auditor/Trazabilidad';
import BusquedaGlobal from './views/auditor/BusquedaGlobal';
import RiskApproval from './views/ehs/RiskApproval';
import ShippingControl from './views/logistics/ShippingControl';
import Scanner from './views/security/Scanner';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta inicial: Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta principal: Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/auditorDashboard" element={<AuditorDashboard />} />
        <Route path="/approval" element={<RiskApproval />} />
        <Route path="/shipping-control" element={<ShippingControl />} />
        
        {/* Ruta para el scanner general */}
        <Route path="/scanner" element={<Scanner />} />

        {/* Rutas adicionales que definimos en el Navbar */}
        <Route path="/activos" element={<Activos/>} />
        <Route path="/prestamos-activos" element={<PrestamosActivos />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* Rutas adicionales para activos */}
        <Route path="/activo/:id" element={<ActivoDetalle />} />
        <Route path="/editar-activo/:id" element={<EditarActivo />} />   
        <Route path="/nuevo-activo" element={<NuevoActivo />} />  
        
        {/* Rutas adicionales admin */}
        <Route path="/admin-mantenimiento" element={<AdminMantenimiento />} />
        <Route path="/firmas" element={<GestionarFirmas />} />

        {/* Rutas adicionales auditor */}
        <Route path="/auditor/trazabilidad/:id" element={<Trazabilidad />} />
        <Route path="/auditor/busqueda" element={<BusquedaGlobal />} />

        {/* Redirección por si el usuario entra a una ruta que no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;