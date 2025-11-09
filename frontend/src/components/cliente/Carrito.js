import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';
import { useMesa } from '../../context/MesaContext';
import { pedidosAPI } from '../../services/api';
import socketService from '../../services/socket';
import { formatearPrecio } from '../../utils/helpers';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../common/ToastContainer';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

/**
 * Componente del carrito de compras
 */
const Carrito = () => {
  const navigate = useNavigate();
  const { items, total, actualizarCantidad, eliminarItem, limpiarCarrito, estaVacio, promocionAplicada, descuentoTotal, quitarPromocion } = useCarrito();
  const { mesaActual, dispositivoId, nombreUsuario } = useMesa();
  const [enviando, setEnviando] = useState(false);
  const [notas, setNotas] = useState('');
  const { toasts, removeToast, success, error } = useToast();

  const handleConfirmarPedido = async () => {
    if (estaVacio()) {
      error('El carrito está vacío');
      return;
    }

    if (!mesaActual || !dispositivoId) {
      error('Debes estar conectado a una mesa para hacer un pedido');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    try {
      setEnviando(true);

      // Preparar items del pedido
      const itemsPedido = items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precio: item.precio, // Incluir precio para soportar promociones
        personalizaciones: item.personalizaciones || {}
      }));

      // Crear el pedido
      const response = await pedidosAPI.crear({
        mesaId: mesaActual._id,
        dispositivoId,
        nombreUsuario,
        items: itemsPedido,
        notas: notas.trim()
      });

      // Emitir evento de nuevo pedido por WebSocket
      socketService.emitirNuevoPedido({
        numeroMesa: mesaActual.numeroMesa,
        pedido: response.data.data
      });

      // Limpiar carrito
      limpiarCarrito();

      // Mostrar éxito y navegar
      success('¡Pedido enviado exitosamente!');
      setTimeout(() => navigate('/mis-pedidos'), 1500);
    } catch (err) {
      console.error('Error al confirmar pedido:', err);
      error('Error al enviar el pedido. Por favor intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (estaVacio()) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ShoppingBag size={80} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-6">Agrega productos del menú para comenzar</p>
        <button
          onClick={() => navigate('/menu')}
          className="btn-primary"
        >
          Ver Menú
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/menu')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-800">Mi Carrito</h1>
            <p className="text-gray-600 text-sm">{items.length} producto(s)</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Lista de items */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div key={`${item.productoId}-${index}`} className="card p-4">
              <div className="flex gap-4">
                <img
                  src={item.imagenUrl}
                  alt={item.nombre}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=Producto';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.nombre}</h3>
                  <p className="text-primary-600 font-bold mb-2">
                    {formatearPrecio(item.precio)}
                  </p>
                  
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1, item.personalizaciones)}
                      className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1, item.personalizaciones)}
                      className="p-1 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Subtotal y botón eliminar */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => eliminarItem(item.productoId, item.personalizaciones)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <span className="font-bold text-gray-800">
                    {formatearPrecio(item.precio * item.cantidad)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notas especiales */}
        <div className="card p-4 mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Notas especiales (opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: Sin cebolla, extra de queso..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows="3"
          />
        </div>
      </div>

      {/* Footer fijo con total y botón */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          {/* Promoción aplicada */}
          {promocionAplicada && (
            <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600 font-semibold">🎉 {promocionAplicada.titulo}</span>
                </div>
                <button
                  onClick={quitarPromocion}
                  className="text-xs text-gray-500 hover:text-red-500 underline"
                >
                  Quitar
                </button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {promocionAplicada.tipoDescuento === 'porcentaje' 
                    ? `Descuento ${promocionAplicada.descuento}%`
                    : 'Descuento fijo'}
                </span>
                <span className="text-green-600 font-bold">
                  -{formatearPrecio(descuentoTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Subtotal y Total */}
          {promocionAplicada && (
            <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatearPrecio(total + descuentoTotal)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatearPrecio(total)}
            </span>
          </div>
          
          <button
            onClick={handleConfirmarPedido}
            disabled={enviando}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando pedido...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
