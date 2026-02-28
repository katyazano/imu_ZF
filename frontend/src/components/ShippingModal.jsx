import React from 'react';
import { Truck, Package, AlertTriangle, Loader2 } from 'lucide-react';

const ShippingModal = ({ 
  isOpen, 
  type, 
  onClose, 
  onConfirm, 
  loading, 
  rejectReason, 
  setRejectReason 
}) => {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
        
        {/* CONTENIDO DINÁMICO SEGÚN EL TIPO */}
        {type === 'validate' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck size={40} className="text-green-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Validar Logística</h3>
            <p className="text-xs text-gray-500 mb-8 font-medium">Aplicarás tu firma electrónica para confirmar que el transportista o proveedor está programado.</p>
          </div>
        )}

        {type === 'support' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Autorizar Soporte</h3>
            <p className="text-xs text-gray-500 mb-8 font-medium">Confirma en el sistema que tu equipo S&R ya empaquetó la chatarra de forma segura.</p>
          </div>
        )}

        {type === 'reject' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Rechazar Salida</h3>
            </div>
            <textarea 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm outline-none focus:border-red-400 mb-6 font-bold"
              placeholder="Motivo de rechazo (Ej. Falta guía de DHL)..."
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={onConfirm} 
            disabled={loading || (type === 'reject' && !rejectReason.trim())}
            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2
              ${type === 'reject' ? 'bg-red-500 text-white' : type === 'support' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}
              disabled:opacity-50`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Acción'}
          </button>
          <button onClick={onClose} disabled={loading} className="w-full py-4 text-gray-400 font-bold uppercase text-[10px]">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingModal;