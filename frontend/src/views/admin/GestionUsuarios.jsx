import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, UserPlus, Edit2, 
  Trash2, Shield, User, Loader2, X, CheckCircle 
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const GestionUsuarios = () => {
const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Edición/Creación
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null); // Si tiene un ID, estamos editando. Si es null, creando.
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    id_rol: ''
  });

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

  // 1. LA MAGIA DEL BOTÓN EDITAR 🪄
  const abrirModalEditar = (usuario) => {
    setFormData({
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      id_rol: usuario.id_rol || ''
    });
    setEditId(usuario.id_usuario); // Le decimos al sistema: "Ojo, vamos a actualizar este ID"
    setModalOpen(true);
  };

  const abrirModalNuevo = () => {
    setFormData({ nombre_completo: '', correo: '', id_rol: '' });
    setEditId(null); // Null significa que será un usuario nuevo
    setModalOpen(true);
  };

  // 2. GUARDAR CAMBIOS (Crea o Actualiza según el editId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      // Si tenemos un editId, usamos PUT (Actualizar). Si no, POST (Crear).
      const metodo = editId ? 'PUT' : 'POST';
      const url = editId ? `${baseUrl}/usuarios/${editId}` : `${baseUrl}/usuarios`;

      const response = await fetch(url, {
        method: metodo,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...formData,
          id_rol: parseInt(formData.id_rol)
        })
      });

      if (response.ok) {
        setModalOpen(false);
        fetchUsuarios(); // Recargamos la lista para ver los cambios
      } else {
        alert("Error al guardar el usuario. Revisa los datos.");
      }
    } catch (error) {
      alert("Error de conexión al servidor.");
    } finally {
      setSaving(false);
    }
  };

  // 3. MAPEO DE ROLES PARA QUE SE VEA PROFESIONAL
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
      
      {/* HEADER */}
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
        <button onClick={abrirModalNuevo} className="bg-white text-[#0070BC] p-3 rounded-2xl shadow-lg active:scale-95 transition-transform">
          <UserPlus size={24} />
        </button>
      </div>

      {/* LISTA DE USUARIOS */}
      <main className="px-6 -mt-10 flex-1 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-[40px] shadow-sm">
            <Loader2 className="animate-spin text-[#0070BC]" size={40} />
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
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{user.correo}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-[#0070BC] text-[8px] font-black uppercase tracking-widest rounded-lg">
                    {getNombreRol(user.id_rol)}
                  </span>
                </div>
              </div>
              
              {/* BOTÓN QUE DETONA LA EDICIÓN */}
              <button 
                onClick={() => abrirModalEditar(user)}
                className="p-3 bg-gray-50 text-[#0070BC] rounded-xl active:scale-90 hover:bg-[#0070BC] hover:text-white transition-all shadow-sm"
              >
                <Edit2 size={18} />
              </button>
            </div>
          ))
        )}
      </main>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
                {editId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Nombre Completo</label>
                <input required type="text" value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC]" />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Correo Electrónico</label>
                <input required type="email" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC]" />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Rol del Sistema</label>
                <select required value={formData.id_rol} onChange={(e) => setFormData({...formData, id_rol: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC] appearance-none">
                  <option value="">Selecciona un rol...</option>
                  <option value="1">Administrador</option>
                  <option value="2">Operario</option>
                  <option value="3">Gerente</option>
                  <option value="6">Seguridad (Caseta)</option>
                  <option value="7">Auditor</option>
                </select>
              </div>

              <button type="submit" disabled={saving} className="w-full mt-6 bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {editId ? 'Actualizar Datos' : 'Registrar'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;