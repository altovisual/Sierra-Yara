import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';

/**
 * Componente para proteger rutas que requieren estar conectado a una mesa
 */
const ProtectedRoute = ({ children }) => {
  const { estaConectado, cargando } = useMesa();

  // Mientras está cargando, mostrar loading
  if (cargando) {
    console.log('⏳ Verificando sesión...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está conectado a una mesa, redirigir a escanear QR
  if (!estaConectado()) {
    console.log('⚠️ Acceso denegado: No conectado a una mesa. Redirigiendo a /escanear');
    return <Navigate to="/escanear" replace />;
  }

  // Si está conectado, mostrar el componente
  return children;
};

export default ProtectedRoute;
