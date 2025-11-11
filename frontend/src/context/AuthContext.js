import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [cargando, setCargando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  // Configurar token en headers de axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verificarToken();
    } else {
      api.defaults.headers.common['Authorization'] = '';
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Verificar token al cargar
  const verificarToken = async () => {
    try {
      const response = await api.get('/auth/verificar');
      setAdmin(response.data.data);
      setAutenticado(true);
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    } finally {
      setCargando(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      
      setToken(data.token);
      setAdmin(data);
      setAutenticado(true);
      localStorage.setItem('adminToken', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      message.success(`¡Bienvenido ${data.nombre}!`);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al iniciar sesión';
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Register (solo para setup inicial)
  const register = async (nombre, email, password) => {
    try {
      const response = await api.post('/auth/register', { nombre, email, password });
      const { data } = response.data;
      
      setToken(data.token);
      setAdmin(data);
      setAutenticado(true);
      localStorage.setItem('adminToken', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      message.success('¡Cuenta creada exitosamente!');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al registrar';
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setAdmin(null);
    setAutenticado(false);
    localStorage.removeItem('adminToken');
    api.defaults.headers.common['Authorization'] = '';
    message.info('Sesión cerrada');
  };

  // Cambiar contraseña
  const cambiarPassword = async (passwordActual, passwordNuevo) => {
    try {
      const response = await api.put('/auth/cambiar-password', {
        passwordActual,
        passwordNuevo
      });
      
      const nuevoToken = response.data.data.token;
      setToken(nuevoToken);
      localStorage.setItem('adminToken', nuevoToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${nuevoToken}`;
      
      message.success('Contraseña actualizada exitosamente');
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al cambiar contraseña';
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    admin,
    token,
    autenticado,
    cargando,
    login,
    register,
    logout,
    cambiarPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
