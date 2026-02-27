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
import Scanner from './views/security/ScannerPage';

// Nuevas Vistas del Usuario
import Categorias from './views/usuario/Categorias';
import FormularioSolicitud from './views/usuario/FormularioSolicitud';
import MisSolicitudes from './views/usuario/MisSolicitudes';
import DetalleSolicitud from './views/usuario/DetalleSolicitud';

// Vistas del Gerente
import GerenteDashboard from "./views/gerente/GerenteDashboard";
import ValidarSolicitudes from "./views/gerente/ValidarSolicitudes";
import HistorialActivo from "./views/gerente/HistorialActivo";

// ==========================================
// 🛡️ GUARDIÁN DE RUTAS (PROTECTED ROUTE)
// ==========================================
const RutaProtegida = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const rol = parseInt(localStorage.getItem('rol'));

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si se especifican roles y el usuario no tiene uno de ellos, redirigir
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    const dashRoutes = {
      1: '/adminDashboard',   
      2: '/categorias',       
      3: '/gerenteDashboard', 
      4: '/shipping-control',
      5: '/approval',
      6: '/scanner',          
      7: '/auditorDashboard'  
    };
    return <Navigate to={dashRoutes[rol] || "/"} replace />; 
  }

  return children;
};



function App() {
  return (
    <Router>
      <Routes>
        {/* ========================================== */}
        {/* 🔓 RUTAS PÚBLICAS                          */}
        {/* ========================================== */}
        <Route path="/" element={<Login />} />

        {/* ========================================== */}
        {/* 🔒 RUTAS COMPARTIDAS (Cualquier Logueado)   */}
        {/* ========================================== */}
        {/* Permitimos acceso general, pero protegemos con el Guardián */}
        <Route path="/activos" element={<RutaProtegida><Activos/></RutaProtegida>} />
        <Route path="/activo/:id" element={<RutaProtegida><ActivoDetalle /></RutaProtegida>} />
        <Route path="/notificaciones" element={<RutaProtegida><Notificaciones /></RutaProtegida>} />
        <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
        
        {/* ✅ CORRECCIÓN: El Scanner ahora es accesible para Kathe (2) y el Gerente (3) */}
        <Route path="/scanner" element={<RutaProtegida rolesPermitidos={[1, 2, 3, 6, 7]}><Scanner /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 👑 RUTAS DE ADMINISTRADOR (Rol 1)          */}
        {/* ========================================== */}
        <Route path="/adminDashboard" element={<RutaProtegida rolesPermitidos={[1]}><AdminDashboard /></RutaProtegida>} />
        <Route path="/nuevo-activo" element={<RutaProtegida rolesPermitidos={[1]}><NuevoActivo /></RutaProtegida>} />
        <Route path="/editar-activo/:id" element={<RutaProtegida rolesPermitidos={[1]}><EditarActivo /></RutaProtegida>} />
        <Route path="/admin-mantenimiento" element={<RutaProtegida rolesPermitidos={[1]}><AdminMantenimiento /></RutaProtegida>} />
        <Route path="/prestamos-activos" element={<RutaProtegida rolesPermitidos={[1]}><PrestamosActivos /></RutaProtegida>} />
        <Route path="/firmas" element={<RutaProtegida rolesPermitidos={[1]}><GestionarFirmas /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 👷 RUTAS DE USUARIO GENERAL (Rol 2)        */}
        {/* ========================================== */}
        {/* Kathe, redirigimos /dashboard a /categorias para consistencia */}
        <Route path="/dashboard" element={<Navigate to="/categorias" replace />} />
        <Route path="/categorias" element={<RutaProtegida rolesPermitidos={[1, 2]}><Categorias /></RutaProtegida>} />
        <Route path="/nueva-solicitud" element={<RutaProtegida rolesPermitidos={[1, 2]}><FormularioSolicitud /></RutaProtegida>} />
        <Route path="/mis-solicitudes" element={<RutaProtegida rolesPermitidos={[1, 2]}><MisSolicitudes /></RutaProtegida>} />
        <Route path="/solicitud/:id" element={<RutaProtegida rolesPermitidos={[1, 2, 3, 4, 5]}><DetalleSolicitud /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 👔 RUTAS DE GERENTE (Rol 3)                */}
        {/* ========================================== */}
        <Route path="/gerenteDashboard" element={<RutaProtegida rolesPermitidos={[3]}><GerenteDashboard /></RutaProtegida>} />
        <Route path="/validar-solicitudes" element={<RutaProtegida rolesPermitidos={[3]}><ValidarSolicitudes /></RutaProtegida>} />
        <Route path="/historial-activo/:id" element={<RutaProtegida rolesPermitidos={[1, 3]}><HistorialActivo /></RutaProtegida>} />

        {/* ========================================== */}
        {/* 📋 RUTAS DE AUDITOR (Rol 7)                */}
        {/* ========================================== */}
        <Route path="/auditorDashboard" element={<RutaProtegida rolesPermitidos={[7]}><AuditorDashboard /></RutaProtegida>} />
        <Route path="/auditor/trazabilidad/:id" element={<RutaProtegida rolesPermitidos={[1, 7]}><Trazabilidad /></RutaProtegida>} />

        {/* ========================================== */}
        {/* ⚠️ OTRAS RUTAS ESPECIALIZADAS              */}
        {/* ========================================== */}
        <Route path="/approval" element={<RutaProtegida rolesPermitidos={[1, 5]}><RiskApproval /></RutaProtegida>} />
        <Route path="/shipping-control" element={<RutaProtegida rolesPermitidos={[1, 4]}><ShippingControl /></RutaProtegida>} />

        {/* Redirección Catch-All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;