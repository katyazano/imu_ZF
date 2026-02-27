import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const rol = parseInt(localStorage.getItem('rol'));
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    // Lógica de redirección por Rol
    if (rol === 7) navigate('/auditorDashboard');
    else if (rol === 2) navigate('/gerenteDashboard');
    else if (rol === 1) navigate('/adminDashboard');
    else navigate('/dashboard'); // Usuario General
  }, [navigate]);

  return null; // No renderiza nada, solo redirige
};

export default HomeRedirect;