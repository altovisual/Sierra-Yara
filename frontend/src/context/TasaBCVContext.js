import React, { createContext, useContext, useState, useEffect } from 'react';
import tasaBCVAPI from '../services/tasaBCVAPI';

/**
 * Contexto para gestionar la tasa BCV en toda la aplicación
 */
const TasaBCVContext = createContext();

export const useTasaBCV = () => {
  const context = useContext(TasaBCVContext);
  if (!context) {
    throw new Error('useTasaBCV debe ser usado dentro de un TasaBCVProvider');
  }
  return context;
};

export const TasaBCVProvider = ({ children }) => {
  const [tasa, setTasa] = useState(36.50); // Valor por defecto
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [fuente, setFuente] = useState('manual');
  const [cargando, setCargando] = useState(true);

  // Cargar tasa al iniciar
  useEffect(() => {
    cargarTasa();
    
    // Actualizar cada 30 minutos
    const interval = setInterval(cargarTasa, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarTasa = async () => {
    try {
      console.log('💱 Cargando tasa BCV...');
      const response = await tasaBCVAPI.obtenerTasaActual();
      
      if (response.data.success) {
        const tasaData = response.data.data;
        setTasa(tasaData.valor);
        setUltimaActualizacion(tasaData.createdAt);
        setFuente(tasaData.fuente);
        console.log('✅ Tasa BCV cargada:', tasaData.valor);
      }
    } catch (error) {
      console.error('❌ Error al cargar tasa BCV:', error);
      // Mantener valor por defecto si falla
    } finally {
      setCargando(false);
    }
  };

  // Convertir USD a Bs
  const convertirUSDaBs = (precioUSD) => {
    return precioUSD * tasa;
  };

  // Formatear precio dual
  const formatearPrecioDual = (precioUSD) => {
    const precioBs = convertirUSDaBs(precioUSD);
    return {
      usd: `$${precioUSD.toFixed(2)}`,
      bs: `Bs. ${precioBs.toFixed(2)}`,
      valorUSD: precioUSD,
      valorBs: precioBs
    };
  };

  const value = {
    tasa,
    ultimaActualizacion,
    fuente,
    cargando,
    cargarTasa,
    convertirUSDaBs,
    formatearPrecioDual
  };

  return <TasaBCVContext.Provider value={value}>{children}</TasaBCVContext.Provider>;
};

export default TasaBCVContext;
