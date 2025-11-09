import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promocionesAPI } from '../../services/api';
import { formatearPrecio } from '../../utils/helpers';
import { ArrowLeft, Tag as TagIcon, Clock, Calendar, Sparkles, ShoppingCart, Check } from 'lucide-react';
import { useMesa } from '../../context/MesaContext';
import { useCarrito } from '../../context/CarritoContext';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../common/ToastContainer';
import dayjs from 'dayjs';

const Promociones = () => {
  const navigate = useNavigate();
  const { mesaActual } = useMesa();
  const { aplicarPromocion, promocionAplicada, agregarItem } = useCarrito();
  const { toasts, removeToast, success } = useToast();
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      const response = await promocionesAPI.obtenerActivas();
      setPromociones(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAplicarPromocion = (promo) => {
    aplicarPromocion(promo);
    success(`¡Promoción "${promo.titulo}" aplicada! El descuento se aplicará automáticamente en tu pedido.`);
    setTimeout(() => {
      navigate('/menu');
    }, 1500);
  };

  const handleAgregarPromocionComoProducto = (promo) => {
    // Si la promoción tiene productos específicos, agregarlos
    if (promo.productos && promo.productos.length > 0) {
      promo.productos.forEach(producto => {
        const precioConDescuento = promo.tipoDescuento === 'porcentaje'
          ? producto.precio * (1 - promo.descuento / 100)
          : Math.max(0, producto.precio - promo.descuento);
        
        const productoConPromo = {
          _id: producto._id,
          nombre: `${producto.nombre} (${promo.titulo})`,
          precio: precioConDescuento,
          imagenUrl: producto.imagenUrl,
          esPromocion: true,
          promocionOriginal: promo.titulo
        };
        
        // Agregar al carrito con personalización que indica que es parte de una promo
        agregarItem(productoConPromo, 1, { 
          promocion: promo.titulo,
          precioOriginal: producto.precio,
          descuento: promo.descuento
        });
      });
      
      success(`¡Productos de "${promo.titulo}" agregados al carrito!`);
    } else {
      // Si no tiene productos específicos, aplicar como descuento general
      aplicarPromocion(promo);
      success(`¡Promoción "${promo.titulo}" aplicada! Agrega productos para obtener el descuento.`);
    }
    
    setTimeout(() => {
      navigate('/carrito');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center gap-2 text-white hover:text-primary-100 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver al Menú</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold flex items-center justify-center gap-2">
              <TagIcon size={28} />
              Promociones del Día
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              Aprovecha nuestras ofertas especiales
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto p-4">
        {promociones.length === 0 ? (
          <div className="text-center py-16">
            <TagIcon size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay promociones activas
            </h3>
            <p className="text-gray-500 mb-6">
              Vuelve pronto para ver nuestras ofertas especiales
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="btn-primary"
            >
              Ver Menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promociones.map((promo) => (
              <div
                key={promo._id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  promo.destacada ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                }`}
              >
                {/* Header con descuento */}
                <div
                  className={`relative p-6 text-white text-center ${
                    promo.destacada
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  }`}
                >
                  {promo.destacada && (
                    <div className="absolute top-2 right-2">
                      <Sparkles size={24} className="text-yellow-200 animate-pulse" />
                    </div>
                  )}
                  
                  <div className="text-sm font-medium opacity-90 mb-1">
                    {promo.tipoDescuento === 'porcentaje' ? 'DESCUENTO' : 'AHORRA'}
                  </div>
                  
                  <div className="text-5xl font-display font-bold mb-2">
                    {promo.tipoDescuento === 'porcentaje'
                      ? `${promo.descuento}%`
                      : formatearPrecio(promo.descuento)}
                  </div>
                  
                  {promo.destacada && (
                    <div className="inline-block bg-white text-orange-500 text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ DESTACADA
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {promo.titulo}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {promo.descripcion}
                  </p>

                  {/* Productos aplicables */}
                  {promo.productos && promo.productos.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">
                        PRODUCTOS:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {promo.productos.slice(0, 3).map((producto) => (
                          <span
                            key={producto._id}
                            className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-lg font-medium"
                          >
                            {producto.nombre}
                          </span>
                        ))}
                        {promo.productos.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                            +{promo.productos.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información de vigencia */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} className="text-primary-500" />
                      <span>
                        Válido hasta: <strong>{dayjs(promo.fechaFin).format('DD/MM/YYYY')}</strong>
                      </span>
                    </div>

                    {promo.horaInicio && promo.horaFin && (
                      promo.horaInicio !== '00:00' || promo.horaFin !== '23:59'
                    ) && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} className="text-primary-500" />
                        <span>
                          Horario: <strong>{promo.horaInicio} - {promo.horaFin}</strong>
                        </span>
                      </div>
                    )}

                    {promo.diasSemana && promo.diasSemana.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <strong>Días:</strong> {promo.diasSemana.map(d =>
                          d.charAt(0).toUpperCase() + d.slice(1)
                        ).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Condiciones */}
                  {promo.condiciones && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 italic">
                        {promo.condiciones}
                      </p>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="mt-4 space-y-2">
                    {/* Botón: Agregar productos con promoción */}
                    {promo.productos && promo.productos.length > 0 ? (
                      <button
                        onClick={() => handleAgregarPromocionComoProducto(promo)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          promo.destacada
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg'
                            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
                        }`}
                      >
                        <ShoppingCart size={20} />
                        Agregar al Carrito
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAplicarPromocion(promo)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          promocionAplicada?._id === promo._id
                            ? 'bg-green-500 text-white'
                            : promo.destacada
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg'
                            : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg'
                        }`}
                      >
                        {promocionAplicada?._id === promo._id ? (
                          <>
                            <Check size={20} />
                            Descuento Aplicado
                          </>
                        ) : (
                          <>
                            <TagIcon size={20} />
                            Aplicar Descuento
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón flotante para ir al menú */}
        {mesaActual && (
          <div className="fixed bottom-20 right-4 z-20">
            <button
              onClick={() => navigate('/menu')}
              className="bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-all hover:scale-110 flex items-center gap-2"
            >
              <ShoppingCart size={24} />
              <span className="hidden sm:inline font-medium">Ver Menú</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Promociones;
