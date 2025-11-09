import React, { useState, useEffect } from 'react';
import { productosAPI } from '../../services/api';
import { Edit2, Trash2, Plus, X, Package } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../common/ToastContainer';
import AdminLayout from './AdminLayout';

/**
 * Componente para gestionar productos (CRUD)
 */
const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const { toasts, removeToast, success, error } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    imagenUrl: '',
    disponible: true
  });

  useEffect(() => {
    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productosAPI.obtenerTodos(),
        productosAPI.obtenerCategorias()
      ]);
      setProductos(prodRes.data.data);
      setCategorias(catRes.data.data);
    } catch (err) {
      error('Error al cargar productos');
      console.error(err);
    }
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setProductoEditando(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        categoria: producto.categoria,
        imagenUrl: producto.imagenUrl,
        disponible: producto.disponible
      });
    } else {
      setProductoEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: categorias[0] || '',
        imagenUrl: '',
        disponible: true
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: '',
      imagenUrl: '',
      disponible: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (productoEditando) {
        await productosAPI.actualizar(productoEditando._id, formData);
        success('Producto actualizado exitosamente');
      } else {
        await productosAPI.crear(formData);
        success('Producto creado exitosamente');
      }
      
      cargarDatos();
      cerrarModal();
    } catch (err) {
      error('Error al guardar producto');
      console.error(err);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await productosAPI.eliminar(id);
      success('Producto eliminado exitosamente');
      cargarDatos();
    } catch (err) {
      error('Error al eliminar producto');
      console.error(err);
    }
  };

  const toggleDisponibilidad = async (producto) => {
    try {
      await productosAPI.actualizar(producto._id, {
        ...producto,
        disponible: !producto.disponible
      });
      success(`Producto ${!producto.disponible ? 'activado' : 'desactivado'}`);
      cargarDatos();
    } catch (err) {
      error('Error al actualizar disponibilidad');
      console.error(err);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
          <p className="text-gray-600">{productos.length} productos en total</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="Todas">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productosFiltrados.map(producto => (
              <tr key={producto._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{producto.nombre}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{producto.descripcion}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{producto.categoria}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  ${Number(producto.precio).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleDisponibilidad(producto)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      producto.disponible
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => abrirModal(producto)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleEliminar(producto._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.imagenUrl}
                  onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formData.disponible}
                  onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
                  Producto disponible
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {productoEditando ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default GestionProductos;
