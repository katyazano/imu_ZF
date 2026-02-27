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
import RiskApproval from './views/ehs/RiskApproval';
import ShippingControl from './views/logistics/ShippingControl';
import Scanner from './views/security/Scanner';
import Categorias from './views/usuario/Categorias';
import FormularioSolicitud from './views/Usuario/FormularioSolicitud';
import MisSolicitudes from './views/Usuario/MisSolicitudes';
import GerenteDashboard from "./views/Gerente/GerenteDashboard";
import ValidarSolicitudes from "./views/Gerente/ValidarSolicitudes";
import HistorialActivo from "./views/Gerente/HistorialActivo";

// ==========================================
// 🛡️ GUARDIÁN DE RUTAS (PROTECTED ROUTE)
// ==========================================
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = parseInt(localStorage.getItem('rol'));

  // 1. Si no hay token, lo pateamos de vuelta al Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Si la ruta exige ciertos roles y el usuario no los tiene, lo mandamos a un lugar seguro
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    // Aquí podrías redirigir a una pantalla de "Acceso Denegado" o a su propio dashboard
    return <Navigate to="/activos" replace />; 
  }

  // Si pasa las pruebas, renderizamos la pantalla
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ========================================== */}
        {/* 🔓 RUTAS PÚBLICAS (Solo Login)               */}
        {/* ========================================== */}
        <Route path="/" element={<Login />} />

        {/* ========================================== */}
        {/* 🔒 RUTAS COMPARTIDAS (Cualquiera logueado)   */}
        {/* ========================================== */}
        {/* Nota: Asumo que estos son los roles: 1:Admin, 2:Gerente, 3:Usuario, 7:Auditor, etc. Ajusta según tu BD */}
        <Route path="/activos" element={<RutaProtegida><Activos/></RutaProtegida>} />
        <Route path="/activo/:id" element={<RutaProtegida><ActivoDetalle /></RutaProtegida>} />
        <Route path="/notificaciones" element={<RutaProtegida><Notificaciones /></RutaProtegida>} />
        <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
        <Route path="/scanner" element={<RutaProtegida><Scanner /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 👑 RUTAS DE ADMINISTRADOR (Rol 1)            */}
        {/* ========================================== */}
        <Route path="/adminDashboard" element={<RutaProtegida rolesPermitidos={[1]}><AdminDashboard /></RutaProtegida>} />
        <Route path="/nuevo-activo" element={<RutaProtegida rolesPermitidos={[1]}><NuevoActivo /></RutaProtegida>} />
        <Route path="/editar-activo/:id" element={<RutaProtegida rolesPermitidos={[1]}><EditarActivo /></RutaProtegida>} />
        <Route path="/admin-mantenimiento" element={<RutaProtegida rolesPermitidos={[1]}><AdminMantenimiento /></RutaProtegida>} />
        <Route path="/prestamos-activos" element={<RutaProtegida rolesPermitidos={[1]}><PrestamosActivos /></RutaProtegida>} />
        <Route path="/firmas" element={<RutaProtegida rolesPermitidos={[1]}><GestionarFirmas /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 👔 RUTAS DE GERENTE (Rol 2)                  */}
        {/* ========================================== */}
        <Route path="/gerenteDashboard" element={<RutaProtegida rolesPermitidos={[2]}><GerenteDashboard /></RutaProtegida>} />
        <Route path="/validar-solicitudes" element={<RutaProtegida rolesPermitidos={[2]}><ValidarSolicitudes /></RutaProtegida>} />
        <Route path="/historial-activo/:id" element={<RutaProtegida rolesPermitidos={[1, 2]}><HistorialActivo /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 👷 RUTAS DE USUARIO GENERAL (Rol 3)          */}
        {/* ========================================== */}
        <Route path="/dashboard" element={<RutaProtegida rolesPermitidos={[3]}><Dashboard /></RutaProtegida>} />
        <Route path="/categorias" element={<RutaProtegida rolesPermitidos={[3]}><Categorias /></RutaProtegida>} />
        <Route path="/nueva-solicitud" element={<RutaProtegida rolesPermitidos={[3]}><FormularioSolicitud /></RutaProtegida>} />
        <Route path="/mis-solicitudes" element={<RutaProtegida rolesPermitidos={[3]}><MisSolicitudes /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 📋 RUTAS DE AUDITOR (Rol 7)                  */}
        {/* ========================================== */}
        <Route path="/auditorDashboard" element={<RutaProtegida rolesPermitidos={[7]}><AuditorDashboard /></RutaProtegida>} />
        <Route path="/auditor/trazabilidad/:id" element={<RutaProtegida rolesPermitidos={[1, 7]}><Trazabilidad /></RutaProtegida>} />

        {/* ========================================== */}
        {/* ⚠️ OTRAS RUTAS ESPECIALIZADAS                */}
        {/* ========================================== */}
        <Route path="/approval" element={<RutaProtegida><RiskApproval /></RutaProtegida>} />
        <Route path="/shipping-control" element={<RutaProtegida><ShippingControl /></RutaProtegida>} />

        {/* Redirección Catch-All (Si la ruta no existe, al login) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;