import React, { createContext, useContext, useState, useEffect } from 'react';
import { mesasAPI } from '../services/api';
import socketService from '../services/socket';
import { guardarEnStorage, obtenerDeStorage, limpiarStorage } from '../utils/helpers';

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
    if (datosGuardados) {
      setMesaActual(datosGuardados.mesa);
      setDispositivoId(datosGuardados.dispositivoId);
      setNombreUsuario(datosGuardados.nombreUsuario);
      
      // Reconectar al socket
      socketService.connect();
      socketService.unirseMesa(datosGuardados.mesa.numeroMesa);
    }
    setCargando(false);
  }, []);

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

      // Guardar en localStorage
      guardarEnStorage('sesionMesa', {
        mesa,
        dispositivoId: nuevoDispositivoId,
        nombreUsuario: nuevoNombre
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
      
      // Actualizar en localStorage
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
    setMesaActual(null);
    setDispositivoId(null);
    setNombreUsuario('');
    limpiarStorage('sesionMesa');
    socketService.disconnect();
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
