import React, { useRef } from 'react';
import { Lock, X } from 'lucide-react';

const Modal2FA = ({ isOpen, onClose, onConfirm }) => {
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  if (!isOpen) return null;

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    // Si escribe un número y no es el último cuadro, salta al siguiente
    if (value.length === 1 && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Si presiona borrar y el cuadro está vacío, regresa al anterior
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

 const handleVerifyClick = () => {
    // Concatenamos los valores de los 6 inputs antes de mandarlos
    const codigoCompleto = inputRefs.map(ref => ref.current.value).join('');
    onConfirm(codigoCompleto); // Enviamos el string al padre
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-[30px] p-8 flex flex-col items-center shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-[#D1E9FF] rounded-full flex items-center justify-center mb-4">
          <Lock className="text-[#0070BC] w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificación 2FA</h2>
        <p className="text-gray-500 text-center text-sm mb-6 px-4">
          Ingresa el código de 6 dígitos enviado a tu correo de **ZF**.
        </p>

        <div className="flex gap-2 mb-8">
          {inputRefs.map((ref, i) => (
            <input
              key={i}
              ref={ref}
              type="text"
              maxLength="1"
              onChange={(e) => handleInputChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-10 h-12 border-2 border-gray-200 rounded-lg text-center text-xl font-bold focus:border-[#0070BC] focus:ring-1 focus:ring-[#0070BC] outline-none transition-all"
            />
          ))}
        </div>

        <div className="flex flex-col w-full gap-3">
          <button 
          onClick={handleVerifyClick} // Cambiamos onConfirm por esta función local
          className="w-full bg-[#0070BC] text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            Verificar e ingresar
          </button>
          <button onClick={onClose} className="text-gray-400 text-sm font-medium hover:text-gray-600">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal2FA;