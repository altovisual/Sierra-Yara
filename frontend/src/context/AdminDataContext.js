import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mesasAPI, pedidosAPI, productosAPI } from '../services/api';

const AdminDataContext = createContext();

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData debe usarse dentro de AdminDataProvider');
  }
  return context;
};

/**
 * Provider que cachea datos del admin para evitar recargas innecesarias
 */
export const AdminDataProvider = ({ children }) => {
  // Estados de caché
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Estados de carga
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [cargandoMesas, setCargandoMesas] = useState(false);
  
  // Timestamps de última actualización
  const [ultimaActualizacionPedidos, setUltimaActualizacionPedidos] = useState(null);
  const [ultimaActualizacionProductos, setUltimaActualizacionProductos] = useState(null);
  const [ultimaActualizacionMesas, setUltimaActualizacionMesas] = useState(null);

  // Tiempo de caché en milisegundos (30 segundos)
  const CACHE_TIME = 30000;

  // Verificar si el caché es válido
  const esCacheValido = (ultimaActualizacion) => {
    if (!ultimaActualizacion) return false;
    return Date.now() - ultimaActualizacion < CACHE_TIME;
  };

  // Cargar pedidos con caché
  const cargarPedidos = useCallback(async (forzar = false) => {
    if (!forzar && esCacheValido(ultimaActualizacionPedidos) && pedidos.length > 0) {
      console.log('📦 Usando caché de pedidos');
      return pedidos;
    }

    try {
      setCargandoPedidos(true);
      const inicio = performance.now();
      
      const response = await pedidosAPI.obtenerTodos();
      const pedidosOrdenados = (response.data.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setPedidos(pedidosOrdenados);
      setUltimaActualizacionPedidos(Date.now());
      
      const tiempo = Math.round(performance.now() - inicio);
      console.log(`⚡ Pedidos cargados en ${tiempo}ms`);
      
      return pedidosOrdenados;
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      throw error;
    } finally {
      setCargandoPedidos(false);
    }
  }, [pedidos, ultimaActualizacionPedidos]);

  // Cargar productos con caché
  const cargarProductos = useCallback(async (forzar = false) => {
    if (!forzar && esCacheValido(ultimaActualizacionProductos) && productos.length > 0) {
      console.log('📦 Usando caché de productos');
      return { productos, categorias };
    }

    try {
      setCargandoProductos(true);
      const inicio = performance.now();
      
      const [prodRes, catRes] = await Promise.all([
        productosAPI.obtenerTodos(),
        productosAPI.obtenerCategorias()
      ]);
      
      setProductos(prodRes.data.data || []);
      setCategorias(catRes.data.data || []);
      setUltimaActualizacionProductos(Date.now());
      
      const tiempo = Math.round(performance.now() - inicio);
      console.log(`⚡ Productos cargados en ${tiempo}ms`);
      
      return { productos: prodRes.data.data, categorias: catRes.data.data };
    } catch (error) {
      console.error('Error al cargar productos:', error);
      throw error;
    } finally {
      setCargandoProductos(false);
    }
  }, [productos, categorias, ultimaActualizacionProductos]);

  // Cargar mesas con caché
  const cargarMesas = useCallback(async (forzar = false) => {
    if (!forzar && esCacheValido(ultimaActualizacionMesas) && mesas.length > 0) {
      console.log('📦 Usando caché de mesas');
      return mesas;
    }

    try {
      setCargandoMesas(true);
      const inicio = performance.now();
      
      const response = await mesasAPI.obtenerTodas();
      const mesasData = (response.data.data || []).sort((a, b) => a.numero - b.numero);
      
      setMesas(mesasData);
      setUltimaActualizacionMesas(Date.now());
      
      const tiempo = Math.round(performance.now() - inicio);
      console.log(`⚡ Mesas cargadas en ${tiempo}ms`);
      
      return mesasData;
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      throw error;
    } finally {
      setCargandoMesas(false);
    }
  }, [mesas, ultimaActualizacionMesas]);

  // Invalidar caché (útil después de crear/actualizar/eliminar)
  const invalidarCache = useCallback((tipo) => {
    switch (tipo) {
      case 'pedidos':
        setUltimaActualizacionPedidos(null);
        break;
      case 'productos':
        setUltimaActualizacionProductos(null);
        break;
      case 'mesas':
        setUltimaActualizacionMesas(null);
        break;
      case 'todo':
        setUltimaActualizacionPedidos(null);
        setUltimaActualizacionProductos(null);
        setUltimaActualizacionMesas(null);
        break;
      default:
        break;
    }
  }, []);

  // Precargar datos al montar
  useEffect(() => {
    const precargarDatos = async () => {
      try {
        await Promise.all([
          cargarPedidos(),
          cargarProductos(),
          cargarMesas()
        ]);
        console.log('✅ Datos precargados');
      } catch (error) {
        console.error('Error al precargar datos:', error);
      }
    };

    precargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar - las funciones son estables con useCallback

  const value = {
    // Datos
    pedidos,
    productos,
    mesas,
    categorias,
    
    // Estados de carga
    cargandoPedidos,
    cargandoProductos,
    cargandoMesas,
    
    // Funciones
    cargarPedidos,
    cargarProductos,
    cargarMesas,
    invalidarCache,
    
    // Utilidades
    esCacheValido: (tipo) => {
      switch (tipo) {
        case 'pedidos':
          return esCacheValido(ultimaActualizacionPedidos);
        case 'productos':
          return esCacheValido(ultimaActualizacionProductos);
        case 'mesas':
          return esCacheValido(ultimaActualizacionMesas);
        default:
          return false;
      }
    }
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export default AdminDataContext;
