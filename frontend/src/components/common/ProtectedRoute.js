import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';

/**
 * Componente para proteger rutas que requieren estar conectado a una mesa
 */
const ProtectedRoute = ({ children }) => {
  const { estaConectado } = useMesa();

  // Si no está conectado a una mesa, redirigir a escanear QR
  if (!estaConectado()) {
    console.log('⚠️ Acceso denegado: No conectado a una mesa. Redirigiendo a /escanear');
    return <Navigate to="/escanear" replace />;
  }

  // Si está conectado, mostrar el componente
  return children;
};

export default ProtectedRoute;
