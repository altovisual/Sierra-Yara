import React, { createContext, useContext, useState, useEffect } from 'react';
import { guardarEnStorage, obtenerDeStorage, calcularTotalCarrito } from '../utils/helpers';

/**
 * Contexto para gestionar el carrito de compras individual
 */
const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [promocionAplicada, setPromocionAplicada] = useState(null);
  const [descuentoTotal, setDescuentoTotal] = useState(0);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    console.log('🛒 Cargando carrito desde localStorage...');
    const carritoGuardado = obtenerDeStorage('carrito');
    const promocionGuardada = obtenerDeStorage('promocion');
    
    if (carritoGuardado && Array.isArray(carritoGuardado)) {
      console.log('✅ Carrito restaurado:', carritoGuardado.length, 'items');
      setItems(carritoGuardado);
    } else {
      console.log('❌ No hay carrito guardado');
    }
    
    if (promocionGuardada) {
      console.log('✅ Promoción restaurada:', promocionGuardada);
      setPromocionAplicada(promocionGuardada);
    }
  }, []);

  // Actualizar total cuando cambien los items o la promoción
  useEffect(() => {
    const subtotal = calcularTotalCarrito(items);
    let descuento = 0;

    if (promocionAplicada) {
      if (promocionAplicada.tipoDescuento === 'porcentaje') {
        descuento = (subtotal * promocionAplicada.descuento) / 100;
      } else {
        descuento = promocionAplicada.descuento;
      }
    }

    setDescuentoTotal(descuento);
    setTotal(Math.max(0, subtotal - descuento));
    guardarEnStorage('carrito', items);
    if (promocionAplicada) {
      guardarEnStorage('promocion', promocionAplicada);
    }
  }, [items, promocionAplicada]);

  // Agregar producto al carrito
  const agregarItem = (producto, cantidad = 1, personalizaciones = {}) => {
    console.log('CarritoContext - agregarItem llamado con:', { producto, cantidad, personalizaciones });
    
    setItems(prevItems => {
      console.log('CarritoContext - items previos:', prevItems);
      
      // Verificar si el producto ya existe en el carrito
      const itemExistente = prevItems.find(
        item => item.productoId === producto._id && 
        JSON.stringify(item.personalizaciones) === JSON.stringify(personalizaciones)
      );

      let nuevosItems;
      if (itemExistente) {
        // Si existe, incrementar la cantidad
        nuevosItems = prevItems.map(item =>
          item.productoId === producto._id && 
          JSON.stringify(item.personalizaciones) === JSON.stringify(personalizaciones)
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        nuevosItems = [
          ...prevItems,
          {
            productoId: producto._id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagenUrl: producto.imagenUrl,
            cantidad,
            personalizaciones,
          },
        ];
      }
      
      console.log('CarritoContext - nuevos items:', nuevosItems);
      return nuevosItems;
    });
  };

  // Eliminar producto del carrito
  const eliminarItem = (productoId, personalizaciones = {}) => {
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.productoId === productoId && 
        JSON.stringify(item.personalizaciones) === JSON.stringify(personalizaciones))
      )
    );
  };

  // Actualizar cantidad de un producto
  const actualizarCantidad = (productoId, cantidad, personalizaciones = {}) => {
    if (cantidad <= 0) {
      eliminarItem(productoId, personalizaciones);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productoId === productoId && 
        JSON.stringify(item.personalizaciones) === JSON.stringify(personalizaciones)
          ? { ...item, cantidad }
          : item
      )
    );
  };

  // Aplicar promoción
  const aplicarPromocion = (promocion) => {
    setPromocionAplicada(promocion);
  };

  // Quitar promoción
  const quitarPromocion = () => {
    setPromocionAplicada(null);
    setDescuentoTotal(0);
    guardarEnStorage('promocion', null);
  };

  // Limpiar carrito
  const limpiarCarrito = () => {
    setItems([]);
    setTotal(0);
    setPromocionAplicada(null);
    setDescuentoTotal(0);
    guardarEnStorage('carrito', []);
    guardarEnStorage('promocion', null);
  };

  // Obtener cantidad total de items
  const obtenerCantidadTotal = () => {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  };

  // Verificar si el carrito está vacío
  const estaVacio = () => {
    return items.length === 0;
  };

  const value = {
    items,
    total,
    promocionAplicada,
    descuentoTotal,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    limpiarCarrito,
    obtenerCantidadTotal,
    estaVacio,
    aplicarPromocion,
    quitarPromocion,
  };

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};
