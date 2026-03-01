import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UserPlus, Edit2, Trash2, Shield, Loader2 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import ModalUsuario from '../../components/ModalUsuario'; // ✅ Importamos el nuevo componente

const GestionUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados ultra-simplificados para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${baseUrl}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsuarios(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario); // Pasamos todo el objeto al modal
    setModalOpen(true);
  };

  const abrirModalNuevo = () => {
    setUsuarioSeleccionado(null); // Null significa "Nuevo Usuario"
    setModalOpen(true);
  };

  const handleDesactivar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas dar de baja a ${nombre}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${baseUrl}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchUsuarios(); 
      } else {
        alert("No se pudo dar de baja al usuario.");
      }
    } catch (error) {
      console.error("Error al desactivar:", error);
    }
  };

  const getNombreRol = (idRol) => {
    const roles = {
      1: 'Administrador', 2: 'Operario', 3: 'Gerente', 
      4: 'Ingeniero', 5: 'Mantenimiento', 6: 'Seguridad', 7: 'Auditor'
    };
    return roles[idRol] || 'Usuario';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-28">
      <Navbar />
      
      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
            <ArrowLeft size={32} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
              Usuarios
            </h1>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mt-1">
              Control de Accesos
            </p>
          </div>
        </div>
        <button onClick={abrirModalNuevo} className="bg-white text-[#0070BC] p-3 rounded-2xl shadow-lg active:scale-95 transition-transform hover:scale-105">
          <UserPlus size={24} />
        </button>
      </div>

      <main className="px-6 -mt-10 flex-1 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-[40px] shadow-sm">
            <Loader2 className="animate-spin text-[#0070BC]" size={40} />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-[30px] border border-gray-100">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No hay usuarios registrados</p>
          </div>
        ) : (
          usuarios.map((user) => (
            <div key={user.id_usuario} className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 group-hover:text-[#0070BC] group-hover:bg-blue-50 transition-colors">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm uppercase italic leading-tight">
                    {user.nombre_completo}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{user.email || user.correo}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-[#0070BC] text-[8px] font-black uppercase tracking-widest rounded-lg">
                    {getNombreRol(user.id_rol)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => abrirModalEditar(user)}
                  className="p-3 bg-gray-50 text-[#0070BC] rounded-xl active:scale-90 hover:bg-[#0070BC] hover:text-white transition-all shadow-sm"
                  title="Editar Usuario"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDesactivar(user.id_usuario, user.nombre_completo)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  title="Dar de baja"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* ✅ COMPONENTE MODAL AISLADO */}
      <ModalUsuario 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        usuarioEdit={usuarioSeleccionado} 
        onSuccess={fetchUsuarios} 
      />
    </div>
  );
};

export default GestionUsuarios;