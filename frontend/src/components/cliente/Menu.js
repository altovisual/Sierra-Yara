import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosAPI } from '../../services/api';
import { agruparPorCategoria, formatearPrecio } from '../../utils/helpers';
import { useCarrito } from '../../context/CarritoContext';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../common/ToastContainer';
import { ShoppingCart, Plus, Search, ClipboardList } from 'lucide-react';

/**
 * Componente del menú interactivo
 */
const Menu = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const { agregarItem, obtenerCantidadTotal } = useCarrito();
  const { toasts, removeToast, success } = useToast();

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
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
      setCategorias(['Todas', ...response.data.data]);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === 'Todas' || producto.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  const productosAgrupados = agruparPorCategoria(productosFiltrados);

  const handleAgregarAlCarrito = (producto) => {
    console.log('Agregando producto al carrito:', producto);
    agregarItem(producto, 1);
    success(`${producto.nombre} agregado al carrito`);
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Sierra Yara Café</h1>
            <p className="text-primary-100 text-sm">Explora nuestro menú</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botón Mis Pedidos */}
            <button
              onClick={() => navigate('/mis-pedidos')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <ClipboardList size={20} />
              <span className="hidden sm:inline">Mis Pedidos</span>
            </button>

            {/* Botón Carrito (solo si hay productos) */}
            {obtenerCantidadTotal() > 0 && (
              <button
                onClick={() => navigate('/carrito')}
                className="flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors relative"
              >
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Carrito</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {obtenerCantidadTotal()}
                </span>
              </button>
            )}
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Filtro de categorías */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categorias.map(categoria => (
              <button
                key={categoria}
                onClick={() => setCategoriaSeleccionada(categoria)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  categoriaSeleccionada === categoria
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de productos por categoría */}
        {Object.keys(productosAgrupados).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          Object.entries(productosAgrupados).map(([categoria, items]) => (
            <div key={categoria} className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
                {categoria}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(producto => (
                  <div
                    key={producto._id}
                    className="card p-4 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setProductoSeleccionado(producto)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Producto';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">
                          {producto.nombre}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {producto.descripcion}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-primary-600 font-bold text-lg">
                            {formatearPrecio(producto.precio)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAgregarAlCarrito(producto);
                            }}
                            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-all active:scale-95"
                          >
                            <Plus size={20} />
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
