import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ArrowLeft, Camera, Loader2, 
  Save, ChevronDown, QrCode, Tag as TagIcon, Box, FileText, Settings 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const NuevoActivo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [archivoFisico, setArchivoFisico] = useState(null); 

  const [catalogos, setCatalogos] = useState({
    categorias: [], disciplinas: [], ubicaciones: [],
    proyectos: [], tipos_compra: [], nacionalidades: []
  });

  const [formData, setFormData] = useState({
    nombre_maquina: '', qr_codigo: '', numero_serie: '', tag: '',
    marca: '', modelo: '', numero_parte: '', anio: '', descripcion: '',
    id_categoria: '', id_disciplina: '', subarea: '', id_ubicacion: '',
    cantidad_inicial: '', es_compra: false, 
    factura: '', pedimento: '', valor_comercial: '',
    id_proyecto: '', id_tipo_compra: '', id_tipo_nacionalidad: '', comentarios: ''
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        const urls = ['categorias', 'disciplinas', 'ubicaciones', 'proyectos', 'tipos_compra', 'nacionalidades'];
        const responses = await Promise.all(
          urls.map(tipo => fetch(`${baseUrl}/catalogos/${tipo}`, { headers: { 'Authorization': `Bearer ${token}` } }))
        );

        const data = await Promise.all(responses.map(res => res.ok ? res.json() : []));

        setCatalogos({
          categorias: data[0], disciplinas: data[1], ubicaciones: data[2],
          proyectos: data[3], tipos_compra: data[4], nacionalidades: data[5]
        });
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      } finally {
        setFetching(false);
      }
    };
    cargarCatalogos();
  }, []);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setArchivoFisico(file); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      const payload = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio, 10) : null,
        cantidad_inicial: formData.cantidad_inicial ? parseFloat(formData.cantidad_inicial) : null,
        // Inyectamos cantidad_actual igual a la inicial automáticamente
        cantidad_actual: formData.cantidad_inicial ? parseFloat(formData.cantidad_inicial) : null,
        valor_comercial: formData.valor_comercial ? parseFloat(formData.valor_comercial) : null,
        
        id_categoria: parseInt(formData.id_categoria, 10),
        id_disciplina: parseInt(formData.id_disciplina, 10),
        id_ubicacion: parseInt(formData.id_ubicacion, 10),
        
        id_proyecto: formData.id_proyecto ? parseInt(formData.id_proyecto, 10) : null,
        id_tipo_compra: formData.id_tipo_compra ? parseInt(formData.id_tipo_compra, 10) : null,
        id_tipo_nacionalidad: formData.id_tipo_nacionalidad ? parseInt(formData.id_tipo_nacionalidad, 10) : null,
        id_estado_maquina: 1 
      };

      // Limpiamos strings vacíos para que Prisma no asigne nulos a campos de texto de forma incorrecta
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      const response = await fetch(`${baseUrl}/activos`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) setShowSuccess(true);
      else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.error || 'Revisa duplicados'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b-2 border-gray-100">
      <Icon size={18} className="text-[#0070BC]" />
      <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Alta de Activo</h1>
      </div>

      <main className="px-6 -mt-12 flex-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100 space-y-4">
          
          <div className="flex flex-col items-center">
             <div onClick={handleImageClick} className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:bg-blue-50 transition-colors cursor-pointer relative overflow-hidden group">
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={32} className="group-hover:text-[#0070BC] transition-colors" />
                    <span className="text-[10px] font-black mt-2 uppercase tracking-widest group-hover:text-[#0070BC]">Subir Foto</span>
                  </>
                )}
             </div>
          </div>

          {fetching ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0070BC]" /></div>
          ) : (
            <div className="space-y-2">
              
              {/* --- IDENTIFICACIÓN --- */}
              <SectionTitle icon={QrCode} title="Identificación Principal" />
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nombre de Máquina*</label>
                <input required type="text" value={formData.nombre_maquina} onChange={(e) => setFormData({...formData, nombre_maquina: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">QR Código*</label>
                  <input required type="text" value={formData.qr_codigo} onChange={(e) => setFormData({...formData, qr_codigo: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">No. Serie*</label>
                  <input required type="text" value={formData.numero_serie} onChange={(e) => setFormData({...formData, numero_serie: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tag</label>
                  <input type="text" value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                  <TagIcon size={16} className="absolute right-3 bottom-4 text-gray-300" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Cantidad Inicial</label>
                  <input type="number" step="0.01" value={formData.cantidad_inicial} onChange={(e) => setFormData({...formData, cantidad_inicial: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

              {/* --- ESPECIFICACIONES --- */}
              <SectionTitle icon={Settings} title="Especificaciones Técnicas" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Marca*</label>
                  <input required type="text" value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Modelo*</label>
                  <input required type="text" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">No. Parte</label>
                  <input type="text" value={formData.numero_parte} onChange={(e) => setFormData({...formData, numero_parte: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Año</label>
                  <input type="number" value={formData.anio} onChange={(e) => setFormData({...formData, anio: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Descripción</label>
                <textarea rows="2" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#0070BC] resize-none" />
              </div>

              {/* --- CLASIFICACIÓN --- */}
              <SectionTitle icon={Box} title="Ubicación y Clasificación" />

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Categoría*</label>
                  <select required value={formData.id_categoria} onChange={(e) => setFormData({...formData, id_categoria: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none appearance-none">
                    <option value="">Elegir...</option>
                    {catalogos.categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-4 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Ubicación*</label>
                  <select required value={formData.id_ubicacion} onChange={(e) => setFormData({...formData, id_ubicacion: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none appearance-none">
                    <option value="">Elegir...</option>
                    {catalogos.ubicaciones.map(u => <option key={u.id_ubicacion} value={u.id_ubicacion}>{u.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-4 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Disciplina (Área)*</label>
                  <select required value={formData.id_disciplina} onChange={(e) => setFormData({...formData, id_disciplina: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none appearance-none">
                    <option value="">Elegir...</option>
                    {catalogos.disciplinas.map(d => <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-4 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Subárea</label>
                  <input type="text" value={formData.subarea} onChange={(e) => setFormData({...formData, subarea: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

              {/* --- ADQUISICIÓN --- */}
              <SectionTitle icon={FileText} title="Datos de Adquisición" />

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tipo Compra</label>
                  <select value={formData.id_tipo_compra} onChange={(e) => setFormData({...formData, id_tipo_compra: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none appearance-none">
                    <option value="">Elegir...</option>
                    {catalogos.tipos_compra.map(t => <option key={t.id_tipo_compra} value={t.id_tipo_compra}>{t.nombre}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-4 text-gray-400 pointer-events-none" size={16} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Valor Comercial</label>
                  <input type="number" step="0.01" value={formData.valor_comercial} onChange={(e) => setFormData({...formData, valor_comercial: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Factura</label>
                  <input type="text" value={formData.factura} onChange={(e) => setFormData({...formData, factura: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Pedimento</label>
                  <input type="text" value={formData.pedimento} onChange={(e) => setFormData({...formData, pedimento: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none" />
                </div>
              </div>

            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#0070BC] text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-8">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Guardar Activo Completo'}
          </button>
        </form>
      </main>

      {/* MODAL DE ÉXITO */}
      {showSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle size={40} className="text-[#0070BC] mb-4" />
            <h2 className="text-xl font-black text-gray-900 text-center uppercase italic">¡Registrado!</h2>
            <button onClick={() => navigate('/activos')} className="mt-8 bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm w-full uppercase tracking-widest">Ver Catálogo</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoActivo;