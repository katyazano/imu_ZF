import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const ModalUsuario = ({ isOpen, onClose, usuarioEdit, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    id_rol: ''
  });

  // Escucha si estamos abriendo el modal para crear o editar
  useEffect(() => {
    if (usuarioEdit) {
      setFormData({
        nombre_completo: usuarioEdit.nombre_completo || '',
        email: usuarioEdit.email || usuarioEdit.correo || '',
        password: '', // Por seguridad, siempre va vacío al editar
        id_rol: usuarioEdit.id_rol || ''
      });
    } else {
      setFormData({ nombre_completo: '', email: '', password: '', id_rol: '' });
    }
  }, [usuarioEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const editId = usuarioEdit ? usuarioEdit.id_usuario : null;
      const metodo = editId ? 'PATCH' : 'POST';
      const url = editId ? `${baseUrl}/usuarios/${editId}` : `${baseUrl}/usuarios`;

      const payload = {
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        id_rol: parseInt(formData.id_rol)
      };

      // La contraseña solo se envía si es un usuario nuevo 
      if (!editId) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method: metodo,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess(); // Recarga la lista en el componente padre
        onClose();   // Cierra el modal
      } else {
        const err = await response.json();
        alert(err.error || "Error al guardar el usuario.");
      }
    } catch (error) {
      alert("Error de conexión al servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">
            {usuarioEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
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
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC]" />
          </div>

          {!usuarioEdit && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Contraseña Temporal</label>
              <input required minLength={6} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC]" placeholder="Mínimo 6 caracteres" />
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Rol del Sistema</label>
            <select required value={formData.id_rol} onChange={(e) => setFormData({...formData, id_rol: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC] appearance-none">
              <option value="">Selecciona un rol...</option>
              <option value="1">Administrador</option>
              <option value="2">Operario (General)</option>
              <option value="3">Gerente</option>
              <option value="4">Logística (S&R)</option>
              <option value="5">Seguridad (EHS)</option>
              <option value="6">Caseta (Guardia)</option>
              <option value="7">Auditor</option>
            </select>
          </div>

          <button type="submit" disabled={saving} className="w-full mt-6 bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {usuarioEdit ? 'Actualizar Datos' : 'Registrar'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalUsuario;