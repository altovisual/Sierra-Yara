import React, { createContext, useContext, useState, useEffect } from 'react';
import { mesasAPI } from '../services/api';
import socketService from '../services/socket';
import { guardarEnStorage, obtenerDeStorage, limpiarStorage } from '../utils/helpers';
import { 
  TIEMPO_EXPIRACION_SESION, 
  LIMPIAR_CARRITO_AL_CAMBIAR_MESA, 
  LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA 
} from '../config/sesion';

/**
 * Contexto para gestionar el estado de la mesa y dispositivo actual
 */
const MesaContext = createContext();

export const useMesa = () => {
  const context = useContext(MesaContext);
  if (!context) {
    throw new Error('useMesa debe ser usado dentro de un MesaProvider');
  }
  return context;
};

export const MesaProvider = ({ children }) => {
  const [mesaActual, setMesaActual] = useState(null);
  const [dispositivoId, setDispositivoId] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const datosGuardados = obtenerDeStorage('sesionMesa');
    console.log('📦 Datos guardados en localStorage:', datosGuardados);
    
    if (datosGuardados && datosGuardados.mesa && datosGuardados.dispositivoId) {
      // Verificar si la sesión ha expirado
      const ahora = Date.now();
      const tiempoTranscurrido = ahora - (datosGuardados.timestamp || 0);
      
      if (tiempoTranscurrido > TIEMPO_EXPIRACION_SESION) {
        console.log('⏰ Sesión expirada. Limpiando datos...');
        limpiarStorage('sesionMesa');
        setCargando(false);
        return;
      }
      
      console.log('✅ Restaurando sesión de mesa:', datosGuardados.mesa.numeroMesa);
      console.log(`⏱️ Tiempo restante: ${Math.round((TIEMPO_EXPIRACION_SESION - tiempoTranscurrido) / 1000 / 60)} minutos`);
      
      setMesaActual(datosGuardados.mesa);
      setDispositivoId(datosGuardados.dispositivoId);
      setNombreUsuario(datosGuardados.nombreUsuario || 'Cliente');
      
      // Reconectar al socket
      socketService.connect();
      socketService.unirseMesa(datosGuardados.mesa.numeroMesa);
    } else {
      console.log('❌ No hay sesión guardada o datos incompletos');
    }
    setCargando(false);
  }, []);

  // Escuchar evento de mesa liberada
  useEffect(() => {
    if (!mesaActual) return;

    const handleMesaLiberada = (data) => {
      console.log('🚪 Mesa liberada por el administrador:', data);
      
      // Mostrar alerta al usuario
      alert(`La mesa ${data.numeroMesa} ha sido liberada por el administrador. Debes volver a conectarte.`);
      
      // Desconectar automáticamente
      desconectarMesa();
      
      // Redirigir a la página de escaneo
      window.location.href = '/escanear';
    };

    socketService.onMesaLiberada(handleMesaLiberada);

    // Cleanup
    return () => {
      socketService.off('mesa-liberada', handleMesaLiberada);
    };
  }, [mesaActual]);

  // Conectar a una mesa (escaneo de QR)
  const conectarMesa = async (numeroMesa, nombre = '') => {
    try {
      setCargando(true);
      setError(null);

      const response = await mesasAPI.conectarDispositivo(numeroMesa, {
        nombreUsuario: nombre || `Cliente ${Date.now()}`
      });

      const { dispositivoId: nuevoDispositivoId, nombreUsuario: nuevoNombre } = response.data.data;

      // Obtener datos completos de la mesa
      const mesaResponse = await mesasAPI.obtenerPorNumero(numeroMesa);
      const mesa = mesaResponse.data.data;

      setMesaActual(mesa);
      setDispositivoId(nuevoDispositivoId);
      setNombreUsuario(nuevoNombre);

      // Guardar en localStorage con timestamp
      guardarEnStorage('sesionMesa', {
        mesa,
        dispositivoId: nuevoDispositivoId,
        nombreUsuario: nuevoNombre,
        timestamp: Date.now() // Agregar timestamp para expiración
      });

      // Conectar al socket y unirse a la sala de la mesa
      socketService.connect();
      socketService.unirseMesa(numeroMesa);

      return { mesa, dispositivoId: nuevoDispositivoId };
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar a la mesa');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  // Actualizar datos de la mesa
  const actualizarMesa = async () => {
    if (!mesaActual) return;

    try {
      const response = await mesasAPI.obtenerPorNumero(mesaActual.numeroMesa);
      setMesaActual(response.data.data);
      
      // Actualizar en localStorage manteniendo el timestamp original
      const datosGuardados = obtenerDeStorage('sesionMesa');
      if (datosGuardados) {
        guardarEnStorage('sesionMesa', {
          ...datosGuardados,
          mesa: response.data.data
        });
      }
    } catch (err) {
      console.error('Error al actualizar mesa:', err);
    }
  };

  // Desconectar de la mesa
  const desconectarMesa = () => {
    console.log('🚪 Desconectando de la mesa y limpiando datos...');
    setMesaActual(null);
    setDispositivoId(null);
    setNombreUsuario('');
    
    // Limpiar sesión de mesa (siempre)
    limpiarStorage('sesionMesa');
    
    // Limpiar carrito según configuración
    if (LIMPIAR_CARRITO_AL_CAMBIAR_MESA) {
      limpiarStorage('carrito');
      limpiarStorage('promocion');
      console.log('🛒 Carrito limpiado');
    }
    
    // Limpiar favoritos según configuración
    if (LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA) {
      limpiarStorage('favoritos');
      console.log('⭐ Favoritos limpiados');
    }
    
    socketService.disconnect();
    console.log('✅ Sesión limpiada completamente');
  };

  // Verificar si el usuario está conectado a una mesa
  const estaConectado = () => {
    return mesaActual !== null && dispositivoId !== null;
  };

  const value = {
    mesaActual,
    dispositivoId,
    nombreUsuario,
    cargando,
    error,
    conectarMesa,
    actualizarMesa,
    desconectarMesa,
    estaConectado,
  };

  return <MesaContext.Provider value={value}>{children}</MesaContext.Provider>;
};
