import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, ArrowLeft, Camera, Loader2, 
  Save, ChevronDown, QrCode, Tag as TagIcon, Box, FileText, Settings, Shield 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ConfigurarReglasActivo from '../components/ConfigurarReglasActivo';

const EditarActivo = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el ID de la URL
  const rolActivo = parseInt(localStorage.getItem('rol')) || 2;
  
  const [loading, setLoading] = useState(true);
  const [isReglasModalOpen, setIsReglasModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- 1. CATÁLOGOS DINÁMICOS ---
  const [catalogos, setCatalogos] = useState({
    categorias: [], disciplinas: [], ubicaciones: [],
    proyectos: [], tipos_compra: [], nacionalidades: [], estados: []
  });

  // --- 2. ESTADO EXACTO DEL SCHEMA ---
  const [formData, setFormData] = useState({
    nombre_maquina: '', qr_codigo: '', numero_serie: '', tag: '',
    marca: '', modelo: '', numero_parte: '', anio: '', descripcion: '',
    id_categoria: '', id_disciplina: '', subarea: '', id_ubicacion: '', id_estado_maquina: '',
    cantidad_inicial: '', cantidad_actual: '', es_compra: false, fecha_compra: '', 
    factura: '', pedimento: '', valor_comercial: '',
    id_proyecto: '', id_tipo_compra: '', id_tipo_nacionalidad: '', comentarios: '',
    foto: null
  });

  // --- 3. CARGAR CATÁLOGOS Y DATOS DEL ACTIVO ---
  useEffect(() => {
    const fetchInicial = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        
        // 1. Cargamos Catálogos
        const urls = ['categorias', 'disciplinas', 'ubicaciones', 'proyectos', 'tipos_compra', 'nacionalidades', 'estados'];
        const responses = await Promise.all(
          urls.map(tipo => fetch(`${baseUrl}/catalogos/${tipo}`, { headers: { 'Authorization': `Bearer ${token}` } }))
        );
        const dataCatalogos = await Promise.all(responses.map(res => res.ok ? res.json() : []));

        setCatalogos({
          categorias: dataCatalogos[0], disciplinas: dataCatalogos[1], ubicaciones: dataCatalogos[2],
          proyectos: dataCatalogos[3], tipos_compra: dataCatalogos[4], nacionalidades: dataCatalogos[5], estados: dataCatalogos[6]
        });

        // 2. Cargamos el Activo a Editar
        const resActivo = await fetch(`${baseUrl}/activos/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resActivo.ok) {
          const dataActivo = await resActivo.json();
          
          // Formateamos la fecha si existe para que el input type="date" la entienda (YYYY-MM-DD)
          const fechaFormateada = dataActivo.fecha_compra ? new Date(dataActivo.fecha_compra).toISOString().split('T')[0] : '';

          setFormData({
            nombre_maquina: dataActivo.nombre_maquina || '',
            qr_codigo: dataActivo.qr_codigo || '',
            numero_serie: dataActivo.numero_serie || '',
            tag: dataActivo.tag || '',
            marca: dataActivo.marca || '',
            modelo: dataActivo.modelo || '',
            numero_parte: dataActivo.numero_parte || '',
            anio: dataActivo.anio || '',
            descripcion: dataActivo.descripcion || '',
            id_categoria: dataActivo.id_categoria || '',
            id_disciplina: dataActivo.id_disciplina || '',
            subarea: dataActivo.subarea || '',
            id_ubicacion: dataActivo.id_ubicacion || '',
            id_estado_maquina: dataActivo.id_estado_maquina || '',
            cantidad_inicial: dataActivo.cantidad_inicial || '',
            cantidad_actual: dataActivo.cantidad_actual || '',
            es_compra: dataActivo.es_compra || false,
            fecha_compra: fechaFormateada,
            factura: dataActivo.factura || '',
            pedimento: dataActivo.pedimento || '',
            valor_comercial: dataActivo.valor_comercial || '',
            id_proyecto: dataActivo.id_proyecto || '',
            id_tipo_compra: dataActivo.id_tipo_compra || '',
            id_tipo_nacionalidad: dataActivo.id_tipo_nacionalidad || '',
            comentarios: dataActivo.comentarios || ''
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInicial();
  }, [id]);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setFormData({ ...formData, foto: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

      // Transformamos campos numéricos antes de enviar para evitar errores en Prisma
      const payload = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : null,
        cantidad_inicial: formData.cantidad_inicial ? parseFloat(formData.cantidad_inicial) : null,
        cantidad_actual: formData.cantidad_actual ? parseFloat(formData.cantidad_actual) : null,
        valor_comercial: formData.valor_comercial ? parseFloat(formData.valor_comercial) : null,
        id_categoria: formData.id_categoria ? parseInt(formData.id_categoria) : null,
        id_disciplina: formData.id_disciplina ? parseInt(formData.id_disciplina) : null,
        id_ubicacion: formData.id_ubicacion ? parseInt(formData.id_ubicacion) : null,
        id_estado_maquina: formData.id_estado_maquina ? parseInt(formData.id_estado_maquina) : null,
        id_proyecto: formData.id_proyecto ? parseInt(formData.id_proyecto) : null,
        id_tipo_compra: formData.id_tipo_compra ? parseInt(formData.id_tipo_compra) : null,
        id_tipo_nacionalidad: formData.id_tipo_nacionalidad ? parseInt(formData.id_tipo_nacionalidad) : null,
        fecha_compra: formData.fecha_compra ? new Date(`${formData.fecha_compra}T00:00:00Z`).toISOString() : null,
      };

      const response = await fetch(`${baseUrl}/activos/${id}`, {
        method: 'PUT', // o PATCH, dependiendo de cómo lo tengas en tu backend
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) setShowSuccess(true);
      else alert("Error al actualizar. Revisa los datos.");
    } catch (e) {
      console.error(e);
      alert("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b-2 border-gray-100">
      <Icon size={18} className="text-[#0070BC]" />
      <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#0070BC] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recuperando datos del equipo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans pb-28">
      <Navbar />
      
      <div className="bg-[#0070BC] p-8 pt-12 pb-20 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white active:scale-90 transition-transform">
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Editar Activo</h1>
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
                    <span className="text-[10px] font-black mt-2 uppercase tracking-widest group-hover:text-[#0070BC]">Cambiar Foto</span>
                  </>
                )}
             </div>
          </div>

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
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Estatus*</label>
                <select required value={formData.id_estado_maquina} onChange={(e) => setFormData({...formData, id_estado_maquina: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-sm text-gray-800 outline-none appearance-none">
                  {catalogos.estados.map(e => <option key={e.id_estado_maquina} value={e.id_estado_maquina}>{e.nombre}</option>)}
                </select>
                <ChevronDown className="absolute right-3 bottom-4 text-gray-400 pointer-events-none" size={16} />
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
          
          {/* --- REGLAS DE NEGOCIO (EXCLUSIVO ADMIN) --- */}
            {rolActivo === 1 && (
              <>
                <SectionTitle icon={Shield} title="Reglas de Negocio y Seguridad" />
                <div className="bg-blue-50/50 border-2 border-[#0070BC]/20 rounded-[25px] p-6 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-[#0070BC] uppercase italic leading-tight">
                      Reglas de Salida Especiales
                    </h4>
                    <p className="text-[10px] font-bold text-gray-500 mt-1 leading-relaxed pr-4">
                      Configura el flujo de firmas estricto para este equipo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReglasModalOpen(true)} 
                    className="bg-white text-[#0070BC] border-2 border-blue-100 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#0070BC] hover:text-white transition-all shrink-0 active:scale-95"
                  >
                    Configurar
                  </button>
                  <ConfigurarReglasActivo 
                    isOpen={isReglasModalOpen} 
                    onClose={() => setIsReglasModalOpen(false)}
                    activoId={id}
                    nombreActivo={formData.nombre_maquina}
                  />
                </div>
              </>
            )}
            
          <button type="submit" disabled={saving} className="w-full bg-[#0070BC] text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-8 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin mx-auto" /> : <><Save size={18} /> Guardar Cambios</>}
          </button>
        </form>
      </main>

      {/* MODAL DE ÉXITO */}
      {showSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xs rounded-[40px] p-10 flex flex-col items-center animate-in zoom-in duration-300">
            <CheckCircle size={40} className="text-[#0070BC] mb-4" />
            <h2 className="text-xl font-black text-gray-900 text-center uppercase italic">¡Actualizado!</h2>
            <button onClick={() => navigate(-1)} className="mt-8 bg-[#0070BC] text-white py-4 rounded-2xl font-black text-sm w-full uppercase tracking-widest">Regresar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarActivo;