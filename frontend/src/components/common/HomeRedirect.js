import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';

/**
 * Componente que maneja la redirección desde la raíz
 * Si hay parámetro ?mesa=X, redirige a escanear
 * Si ya está conectado, redirige al menú
 * Si no, redirige a escanear
 */
const HomeRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { estaConectado } = useMesa();
  
  useEffect(() => {
    const mesaParam = searchParams.get('mesa');
    
    console.log('🏠 HomeRedirect - mesa param:', mesaParam);
    console.log('🏠 HomeRedirect - está conectado:', estaConectado());
    
    if (mesaParam) {
      // Si hay parámetro de mesa, redirigir a escanear con el parámetro
      console.log('🏠 Redirigiendo a /escanear?mesa=' + mesaParam);
      navigate(`/escanear?mesa=${mesaParam}`, { replace: true });
    } else if (estaConectado()) {
      // Si ya está conectado, ir al menú
      console.log('🏠 Redirigiendo a /menu');
      navigate('/menu', { replace: true });
    } else {
      // Si no hay nada, ir a escanear
      console.log('🏠 Redirigiendo a /escanear');
      navigate('/escanear', { replace: true });
    }
  }, [searchParams, estaConectado, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl">Cargando...</p>
      </div>
    </div>
  );
};

export default HomeRedirect;
