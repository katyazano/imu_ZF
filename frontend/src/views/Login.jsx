import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShieldCheck } from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';
import Modal2FA from '../components/Modal2FA';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [isCaptchaDone, setIsCaptchaDone] = useState(false);

  // Simulación del flujo de Login
  const handleInitialLogin = (e) => {
    e.preventDefault();
    if (isCaptchaDone) {
      // Si el captcha está "listo", abrimos el modal de 2FA
      setShow2FA(true);
    } else {
      alert("Por favor, confirma que no eres un robot.");
    }
  };

  const handleFinalVerify = (codigoIngresado) => {
    // Ahora el código llega por parámetro, ya no dependemos de inputRefs aquí
    console.log("Código 2FA recibido en Login:", codigoIngresado);

    setShow2FA(false);
    navigate('/adminDashboard'); // Simulación exitosa
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden font-sans">
      
      {/* Fondo: Triángulo Superior */}
      <div 
        className="absolute top-0 left-0 w-full h-20 bg-[#0070BC] z-0" 
        style={{ clipPath: 'polygon(0 0, 50% 0, 0 100%)' }}
      ></div>

      <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center -mt-10">
        
        {/* Logo ZF */}
        <div className="mb-2 mt-12">
          <img src={zfLogo} alt="ZF Logo" className="w-32 h-auto object-contain" />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-3">
          <h1 className="text-5xl font-black text-gray-900 leading-tight">Welcome</h1>
          <div className="w-32 h-2 bg-[#0070BC] mt-1"></div>
        </div>

        {/* Card Formulario */}
        <div className="w-full bg-[#D1E9FF] rounded-[45px] p-10 shadow-xl">
          <form onSubmit={handleInitialLogin} className="flex flex-col gap-6">
            
            <div className="relative border-b-2 border-gray-400 flex items-center pb-2">
              <input 
                type="email" placeholder="email" 
                className="bg-transparent w-full outline-none text-xl text-gray-700 placeholder-gray-500"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required
              />
              <User className="text-gray-600 w-6 h-6 ml-2" />
            </div>

            <div className="relative border-b-2 border-gray-400 flex items-center pb-2">
              <input 
                type="password" placeholder="password" 
                className="bg-transparent w-full outline-none text-xl text-gray-700 placeholder-gray-500"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="text-gray-600 w-6 h-6 ml-2" />
            </div>

            {/* Simulación Visual de CAPTCHA */}
            <div 
              onClick={() => setIsCaptchaDone(!isCaptchaDone)}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${isCaptchaDone ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}>
                  {isCaptchaDone && <ShieldCheck size={18} className="text-white" />}
                </div>
                <span className="text-sm text-gray-600 font-medium">No soy un robot</span>
              </div>
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 h-8 opacity-70" />
            </div>

            <div className="flex flex-col gap-5 mt-2">
              <button type="button" className="text-[#0070BC] text-sm font-bold text-left w-fit hover:underline">
                Forgot password?
              </button>

              <button 
                type="submit" 
                className={`w-full font-bold py-4 rounded-2xl text-2xl shadow-lg transition-all active:scale-95
                  ${isCaptchaDone ? 'bg-[#0070BC] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Fondo: Triángulo Inferior */}
      <div 
        className="absolute bottom-0 right-0 w-full h-32 bg-[#0070BC] z-0" 
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      ></div>

      {/* Modal de 2FA */}
      <Modal2FA 
        isOpen={show2FA} 
        onClose={() => setShow2FA(false)} 
        onConfirm={handleFinalVerify} 
      />
    </div>
  );
};

export default Login;