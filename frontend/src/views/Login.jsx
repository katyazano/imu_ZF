import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import zfLogo from '../assets/zf-logo.png';
import Modal2FA from '../components/Modal2FA';

const Login = () => {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  
  // Estado para el Token que nos da Google
  const [captchaToken, setCaptchaToken] = useState(null);
  
  // Estados para la conexión con el Backend
  const [userId, setUserId] = useState(null); 
  const [errorBackend, setErrorBackend] = useState(''); 

  // ==========================================
  // LÓGICA CENTRALIZADA DE RUTEO
  // ==========================================
  const redirigirPorRol = (roleId) => {
    const dashRoutes = {
      1: '/adminDashboard',   // Administrador
      2: '/categorias',       // Usuario General
      3: '/gerenteDashboard', // Gerente
      4: '/logisticaDashboard', // S&R (Puedes crear esta vista después)
      5: '/ehsDashboard',     // EHS (Puedes crear esta vista después)
      6: '/scanner',          // Seguridad
      7: '/auditorDashboard'  // Auditor
    };

    const destination = dashRoutes[roleId] || '/login';
    navigate(destination);
  };

  // ==========================================
  // 1. PRIMER PASO: Validar usuario, password y Captcha
  // ==========================================
  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setErrorBackend(''); 

    if (!captchaToken) {
      setErrorBackend("Por favor, confirma que no eres un robot.");
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email, 
            password: password,
            captchaToken: captchaToken 
        }) 
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2fa) { 
          setUserId(data.userId); 
          setShow2FA(true); 
        } else {
          localStorage.setItem('token', data.token);
          
          const role = data.user?.id_rol ? parseInt(data.user.id_rol) : null;
          if (role) localStorage.setItem('rol', role);

          // Usamos la función centralizada
          redirigirPorRol(role);
        }
      } else {
        setErrorBackend(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error("Error de red:", error);
      setErrorBackend("No se pudo conectar con el servidor.");
    }
  };

  // ==========================================
  // 2. SEGUNDO PASO: Validar código 2FA
  // ==========================================
  const handleFinalVerify = async (codigoIngresado) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${baseUrl}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, codigo2FA: codigoIngresado })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        
        const role = data.user?.id_rol ? parseInt(data.user.id_rol) : null;
        if (role) localStorage.setItem('rol', role);
        
        setShow2FA(false);
        
        // ¡Aquí estaba el error! Ahora también usamos la función centralizada
        redirigirPorRol(role); 
      } else {
        alert(data.error || "Código de verificación incorrecto");
      }
    } catch (error) {
      console.error("Error verificando 2FA:", error);
      alert("Error de conexión al verificar el código.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden font-sans">
      
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-20 bg-[#0070BC] z-0" style={{ clipPath: 'polygon(0 0, 50% 0, 0 100%)' }}></div>

      <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center -mt-10">
        
        <div className="mb-2 mt-12">
          <img src={zfLogo} alt="ZF Logo" className="w-32 h-auto object-contain" />
        </div>

        <div className="flex flex-col items-center mb-3">
          <h1 className="text-5xl font-black text-gray-900 leading-tight">Welcome</h1>
          <div className="w-32 h-2 bg-[#0070BC] mt-1"></div>
        </div>

        {/* Card Formulario */}
        <div className="w-full bg-[#D1E9FF] rounded-[45px] p-10 shadow-xl">
          
          {errorBackend && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm font-semibold text-center">
              {errorBackend}
            </div>
          )}

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

            {/* --- COMPONENTE GOOGLE RECAPTCHA --- */}
            <div className="flex justify-center scale-90 -mx-10 transform origin-center">
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" 
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>

            <div className="flex flex-col gap-5 mt-2">
              <button type="button" className="text-[#0070BC] text-sm font-bold text-left w-fit hover:underline">
                Forgot password?
              </button>

              <button 
                type="submit" 
                disabled={!captchaToken}
                className={`w-full font-bold py-4 rounded-2xl text-2xl shadow-lg transition-all active:scale-95
                  ${captchaToken ? 'bg-[#0070BC] text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-full h-32 bg-[#0070BC] z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>

      <Modal2FA 
        isOpen={show2FA} 
        onClose={() => setShow2FA(false)} 
        onConfirm={handleFinalVerify} 
      />
    </div>
  );
};

export default Login;