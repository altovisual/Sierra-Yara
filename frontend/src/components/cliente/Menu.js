import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI, promocionesAPI } from '../../services/api';
import { agruparPorCategoria, formatearPrecio } from '../../utils/helpers';
import { useCarrito } from '../../context/CarritoContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { useTasaBCV } from '../../context/TasaBCVContext';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../common/ToastContainer';
import { ShoppingCart, Plus, Search, ClipboardList, Tag, TrendingUp, Heart } from 'lucide-react';
import logo from '../../assets/logo.png';

/**
 * Componente del menú interactivo
 */
const Menu = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [productosConPromo, setProductosConPromo] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const { agregarItem, obtenerCantidadTotal } = useCarrito();
  const { toggleFavorito, esFavorito } = useFavoritos();
  const { formatearPrecioDual } = useTasaBCV();
  const { toasts, removeToast, success, info } = useToast();

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarPromociones();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await productosAPI.obtenerTodos({ disponible: true });
      setProductos(response.data.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await productosAPI.obtenerCategorias();
      setCategorias(['Todas', 'Promociones', ...response.data.data]);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarPromociones = async () => {
    try {
      const response = await promocionesAPI.obtenerActivas();
      const promosActivas = response.data.data || [];
      
      // Crear productos con descuento de las promociones
      const productosPromo = [];
      promosActivas.forEach(promo => {
        if (promo.productos && promo.productos.length > 0) {
          promo.productos.forEach(producto => {
            console.log(`Procesando producto: ${producto.nombre}, Precio: ${producto.precio}, Descuento: ${promo.descuento}, Tipo: ${promo.tipoDescuento}`);
            
            let precioConDescuento;
            if (promo.tipoDescuento === 'porcentaje') {
              precioConDescuento = producto.precio * (1 - promo.descuento / 100);
            } else {
              // Para descuento fijo, asegurar que el precio no sea negativo
              // y que al menos quede un precio mínimo
              precioConDescuento = Math.max(0.50, producto.precio - promo.descuento);
            }
            
            console.log(`Precio con descuento: ${precioConDescuento}`);
            
            // Solo agregar si el precio es válido
            if (precioConDescuento > 0) {
              productosPromo.push({
                ...producto,
                precioOriginal: producto.precio,
                precio: precioConDescuento,
                descuento: promo.descuento,
                tipoDescuento: promo.tipoDescuento,
                promocion: promo.titulo,
                esPromocion: true,
                categoria: 'Promociones'
              });
            } else {
              console.warn(`Producto ${producto.nombre} tiene precio 0 después del descuento, no se agregará`);
            }
          });
        }
      });
      
      setProductosConPromo(productosPromo);
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    }
  };

  // Combinar productos normales con productos de promociones
  const todosLosProductos = categoriaSeleccionada === 'Promociones' 
    ? productosConPromo 
    : categoriaSeleccionada === 'Todas'
    ? [...productosConPromo, ...productos]
    : productos;

  const productosFiltrados = todosLosProductos.filter(producto => {
    if (!producto) return false;
    
    const busquedaLower = (busqueda || '').toLowerCase();
    const nombreCoincide = (producto.nombre || '').toLowerCase().includes(busquedaLower);
    const descripcionCoincide = (producto.descripcion || '').toLowerCase().includes(busquedaLower);
    const coincideBusqueda = nombreCoincide || descripcionCoincide;
    const coincideCategoria = categoriaSeleccionada === 'Todas' || producto.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  const productosAgrupados = agruparPorCategoria(productosFiltrados);

  const handleAgregarAlCarrito = (producto) => {
    // Verificar que el producto tenga un precio válido
    if (!producto.precio || producto.precio === 0) {
      console.error('Error: Producto con precio 0 o inválido', producto);
      return;
    }
    
    agregarItem(producto, 1);
    
    // Vibración sutil en dispositivos móviles
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms de vibración
    }
    
    // Animación del botón del carrito
    const carritoBtn = document.querySelector('[data-carrito-btn]');
    if (carritoBtn) {
      carritoBtn.classList.add('animate-bounce');
      setTimeout(() => {
        carritoBtn.classList.remove('animate-bounce');
      }, 500);
    }
  };

  const handleToggleFavorito = (e, producto) => {
    e.stopPropagation();
    const agregado = toggleFavorito(producto._id);
    if (agregado) {
      success(`❤️ ${producto.nombre} agregado a favoritos`);
    } else {
      info(`${producto.nombre} quitado de favoritos`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Sierra Yara Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-display font-bold">Sierra Yara Café</h1>
              <p className="text-primary-100 text-sm">Explora nuestro menú</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botón Mis Pedidos */}
            <button
              onClick={() => navigate('/mis-pedidos')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
            >
              <ClipboardList size={18} />
              <span className="hidden sm:inline text-sm">Pedidos</span>
            </button>

            {/* Botón Carrito */}
            <button
              data-carrito-btn
              onClick={() => navigate('/carrito')}
              className="flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all relative"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Carrito</span>
              {obtenerCantidadTotal() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {obtenerCantidadTotal()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filtro de categorías - Sticky */}
        <div className="sticky top-[112px] z-10 bg-gray-50 -mx-4 px-4 py-3 mb-6 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 justify-start lg:justify-center flex-nowrap lg:flex-wrap">
                {categorias.map(categoria => (
                  <button
                    key={categoria}
                    onClick={() => setCategoriaSeleccionada(categoria)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-1 text-sm font-medium ${
                      categoria === 'Promociones'
                        ? categoriaSeleccionada === categoria
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 hover:from-yellow-200 hover:to-orange-200'
                        : categoriaSeleccionada === categoria
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {categoria === 'Promociones' && <Tag size={16} />}
                    {categoria}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos por categoría */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="text-gray-500 mt-4">Cargando productos...</p>
          </div>
        ) : Object.keys(productosAgrupados).length === 0 ? (
          <div className="text-center py-12 fade-in">
            <div className="text-gray-400 mb-4">
              <Search size={64} className="mx-auto mb-4 opacity-50" />
            </div>
            <p className="text-gray-600 text-lg font-semibold mb-2">
              {busqueda ? 'No se encontraron resultados' : 'No hay productos disponibles'}
            </p>
            {busqueda && (
              <p className="text-gray-500 text-sm">
                Intenta con otro término de búsqueda
              </p>
            )}
          </div>
        ) : (
          Object.entries(productosAgrupados).map(([categoria, items], idx) => (
            <div key={categoria} className={`mb-8 slide-in-up delay-${Math.min(idx + 1, 5)}`}>
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4 fade-in">
                {categoria}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((producto, prodIdx) => (
                  <div
                    key={producto._id}
                    className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02] hover-lift slide-in-up delay-${Math.min(prodIdx + 1, 5)} ${
                      producto.esPromocion ? 'ring-2 ring-yellow-400 shadow-yellow-100' : ''
                    }`}
                    onClick={() => setProductoSeleccionado(producto)}
                  >
                    {/* Botón de Favorito */}
                    <button
                      onClick={(e) => handleToggleFavorito(e, producto)}
                      className={`absolute top-3 left-3 z-10 p-2 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg ${
                        esFavorito(producto._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        size={20}
                        className={esFavorito(producto._id) ? 'fill-current' : ''}
                      />
                    </button>

                    {/* Badge de promoción */}
                    {producto.esPromocion && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Tag size={14} />
                          {producto.tipoDescuento === 'porcentaje' 
                            ? `-${producto.descuento}%` 
                            : `-Bs.${producto.descuento}`}
                        </div>
                      </div>
                    )}
                    
                    {/* Efecto de brillo al hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700 ease-out"></div>
                    
                    <div className="flex gap-4 p-4 relative">
                      {/* Imagen del producto */}
                      <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all">
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center"><svg class="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        </div>
                        {/* Badge de nuevo o popular (opcional) */}
                        {producto.nuevo && (
                          <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Nuevo
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {producto.nombre}
                        </h3>
                        
                        {/* Mostrar nombre de promoción si aplica */}
                        {producto.esPromocion && producto.promocion && (
                          <div className="flex items-center gap-1 mb-2">
                            <TrendingUp size={14} className="text-yellow-600" />
                            <p className="text-xs text-yellow-600 font-bold">
                              {producto.promocion}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {producto.descripcion}
                        </p>
                        
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col gap-1">
                            {/* Precio con descuento */}
                            <div className="flex flex-col gap-0.5">
                              {/* Precio en USD */}
                              <div className="flex items-baseline gap-2">
                                <span className={`font-bold text-xl ${
                                  producto.esPromocion ? 'text-orange-600' : 'text-primary-600'
                                }`}>
                                  {formatearPrecioDual(producto.precio).usd}
                                </span>
                                
                                {/* Precio original tachado */}
                                {producto.esPromocion && producto.precioOriginal && (
                                  <span className="text-gray-400 text-sm line-through">
                                    {formatearPrecioDual(producto.precioOriginal).usd}
                                  </span>
                                )}
                              </div>
                              
                              {/* Precio en Bs */}
                              <div className="flex items-baseline gap-2">
                                <span className="text-gray-600 text-sm font-semibold">
                                  {formatearPrecioDual(producto.precio).bs}
                                </span>
                                {producto.esPromocion && producto.precioOriginal && (
                                  <span className="text-gray-400 text-xs line-through">
                                    {formatearPrecioDual(producto.precioOriginal).bs}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Ahorro */}
                            {producto.esPromocion && producto.precioOriginal && (
                              <span className="text-green-600 text-xs font-semibold">
                                ¡Ahorras {formatearPrecio(producto.precioOriginal - producto.precio)}!
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAgregarAlCarrito(producto);
                            }}
                            className={`p-3 rounded-xl transition-all transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl ${
                              producto.esPromocion
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
                                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white'
                            }`}
                          >
                            <Plus size={22} className="drop-shadow-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón flotante del carrito */}
      {obtenerCantidadTotal() > 0 && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => navigate('/carrito')}
            className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all relative"
          >
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {obtenerCantidadTotal()}
            </span>
          </button>
        </div>
      )}

      {/* Modal de detalle del producto */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4"
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={productoSeleccionado.imagenUrl}
              alt={productoSeleccionado.nombre}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400?text=Producto';
              }}
            />
            <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">
              {productoSeleccionado.nombre}
            </h3>
            <p className="text-gray-600 mb-4">{productoSeleccionado.descripcion}</p>
            <p className="text-3xl font-bold text-primary-600 mb-6">
              {formatearPrecio(productoSeleccionado.precio)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleAgregarAlCarrito(productoSeleccionado);
                  setProductoSeleccionado(null);
                }}
                className="btn-primary flex-1"
              >
                Agregar al carrito
              </button>
              <button
                onClick={() => setProductoSeleccionado(null)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;
