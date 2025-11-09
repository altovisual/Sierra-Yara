import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';
import { pedidosAPI } from '../../services/api';
import socketService from '../../services/socket';
import { formatearHora, obtenerColorEstado, obtenerTextoEstado } from '../../utils/helpers';
import { useTasaBCV } from '../../context/TasaBCVContext';
import { Clock, CheckCircle, ChefHat, Package, ArrowLeft, XCircle, ShoppingCart } from 'lucide-react';

/**
 * Componente para ver el estado de los pedidos del usuario
 */
const MisPedidos = () => {
  const navigate = useNavigate();
  const { dispositivoId, mesaActual } = useMesa();
  const { formatearPrecioDual } = useTasaBCV();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (dispositivoId) {
      cargarPedidos();
      
      // Escuchar actualizaciones de estado en tiempo real
      socketService.onEstadoPedidoActualizado((data) => {
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido._id === data.pedidoId
              ? { ...pedido, estado: data.estado }
              : pedido
          )
        );
      });

      return () => {
        socketService.off('estado_pedido_actualizado');
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispositivoId]);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const response = await pedidosAPI.obtenerPorDispositivo(dispositivoId);
      setPedidos(response.data.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'recibido':
        return <Clock className="text-blue-500" size={24} />;
      case 'en_preparacion':
        return <ChefHat className="text-yellow-500" size={24} />;
      case 'listo':
        return <Package className="text-green-500" size={24} />;
      case 'entregado':
        return <CheckCircle className="text-gray-500" size={24} />;
      case 'cancelado':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Clock className="text-gray-400" size={24} />;
    }
  };

  const obtenerPasoActual = (estado) => {
    const pasos = ['recibido', 'en_preparacion', 'listo', 'entregado'];
    return pasos.indexOf(estado) + 1;
  };

  if (!dispositivoId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No estás conectado a una mesa
          </h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Escanear QR
          </button>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/menu')}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold">Mis Pedidos</h1>
              <p className="text-primary-100 text-sm">Mesa {mesaActual?.numeroMesa}</p>
            </div>
          </div>

          {/* Botón para volver al menú */}
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Menú</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <Package size={80} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-gray-600 mb-6">
              Explora nuestro menú y haz tu primer pedido
            </p>
            <button onClick={() => navigate('/menu')} className="btn-primary">
              Ver Menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(pedido => (
              <div key={pedido._id} className="card p-4">
                {/* Header del pedido */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {obtenerIconoEstado(pedido.estado)}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Pedido #{pedido._id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatearHora(pedido.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${obtenerColorEstado(pedido.estado)}`}>
                    {obtenerTextoEstado(pedido.estado)}
                  </span>
                </div>

                {/* Tracker de progreso del pedido */}
                {pedido.estado !== 'cancelado' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between relative">
                      {/* Línea de progreso */}
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                        <div 
                          className="h-full bg-primary-600 transition-all duration-500"
                          style={{ 
                            width: `${(obtenerPasoActual(pedido.estado) / 4) * 100}%` 
                          }}
                        />
                      </div>

                      {/* Paso 1: Recibido */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          obtenerPasoActual(pedido.estado) >= 1 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Clock size={20} />
                        </div>
                        <span className="text-xs mt-2 text-gray-600">Recibido</span>
                      </div>

                      {/* Paso 2: En Preparación */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          obtenerPasoActual(pedido.estado) >= 2 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <ChefHat size={20} />
                        </div>
                        <span className="text-xs mt-2 text-gray-600">Preparando</span>
                      </div>

                      {/* Paso 3: Listo */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          obtenerPasoActual(pedido.estado) >= 3 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Package size={20} />
                        </div>
                        <span className="text-xs mt-2 text-gray-600">Listo</span>
                      </div>

                      {/* Paso 4: Entregado */}
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          obtenerPasoActual(pedido.estado) >= 4 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <CheckCircle size={20} />
                        </div>
                        <span className="text-xs mt-2 text-gray-600">Entregado</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje para pedidos cancelados */}
                {pedido.estado === 'cancelado' && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <XCircle className="text-red-600" size={20} />
                    <span className="text-sm text-red-800">Este pedido ha sido cancelado</span>
                  </div>
                )}

                {pedido.notas && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Notas:</span> {pedido.notas}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">${pedido.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{formatearPrecioDual(pedido.total).bs}</div>
                  </div>
                </div>

                {/* Botón de pago si no está pagado */}
                {!pedido.pagado && pedido.estado !== 'cancelado' && (
                  <button
                    onClick={() => navigate(`/pago/${pedido._id}`)}
                    className="btn-primary w-full mt-4"
                  >
                    Pagar Ahora
                  </button>
                )}

                {pedido.pagado && (
                  <div className="mt-4 text-center">
                    <span className="badge badge-success">
                      ✓ Pagado
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón para ver cuenta completa de la mesa */}
        {pedidos.length > 0 && (
          <button
            onClick={() => navigate('/cuenta-mesa')}
            className="btn-outline w-full mt-6"
          >
            Ver Cuenta Completa de la Mesa
          </button>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;
