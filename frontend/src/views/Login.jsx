import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import zfLogo from '../assets/zf-logo.png';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login con:", email);
    
    // 3. Simular validación y navegar al Dashboard
    navigate('/dashboard'); 
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden font-sans">
      
      {/* Triángulo Superior */}
      <div 
        className="absolute top-0 left-0 w-full h-20 bg-[#0070BC] z-0" 
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      ></div>

      <div className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center">
        
        {/* Logo ZF */}
        <div className="mb-6 mt-12">
          <img src={zfLogo} alt="ZF Logo" className="w-32 h-auto object-contain" />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-5xl font-black text-gray-900 leading-tight">Welcome</h1>
          <div className="w-32 h-1.5 bg-[#0070BC]"></div>
        </div>

        {/* Card Formulario - Usando el azul claro de Figma */}
        <div className="w-full bg-[#D1E9FF] rounded-[45px] p-10 shadow-xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-8">
            
            {/* Input Email */}
            <div className="relative border-b-2 border-gray-400 flex items-center pb-2">
              <input 
                type="email" 
                placeholder="email" 
                className="bg-transparent w-full outline-none text-xl text-gray-700 placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <User className="text-gray-600 w-6 h-6 ml-2" />
            </div>

            {/* Input Password */}
            <div className="relative border-b-2 border-gray-400 flex items-center pb-2">
              <input 
                type="password" 
                placeholder="password" 
                className="bg-transparent w-full outline-none text-xl text-gray-700 placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="text-gray-600 w-6 h-6 ml-2" />
            </div>

            <div className="flex flex-col gap-6 mt-2">
              <button 
                type="button" 
                className="text-[#0070BC] text-sm font-bold text-left hover:underline"
              >
                Forgot password?
              </button>

              {/* Botón Login Estilo Mobile First */}
              <button 
                type="submit" 
                className="w-full bg-[#0070BC] text-white font-bold py-4 rounded-2xl text-2xl shadow-lg active:scale-95 transition-all"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Triángulo Inferior */}
      <div 
        className="absolute bottom-0 right-0 w-full h-32 bg-[#0070BC] z-0" 
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
      ></div>
    </div>
  );
};

export default Login;