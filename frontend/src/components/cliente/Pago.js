import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pedidosAPI, configAPI } from '../../services/api';
import { formatearPrecio, calcularPropina } from '../../utils/helpers';
import { CreditCard, Smartphone, DollarSign, ArrowLeft, Copy, Check, Fingerprint, Gift, CheckCircle } from 'lucide-react';

/**
 * Componente para procesar el pago de un pedido
 */
const Pago = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState(null);
  const [datosPago, setDatosPago] = useState(null);
  const [metodoPago, setMetodoPago] = useState('');
  const [propinaPorcentaje, setPropinaPorcentaje] = useState(10);
  const [propinaPersonalizada, setPropinaPersonalizada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [copiado, setCopiado] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [previsualizacion, setPrevisualizacion] = useState(null);

  useEffect(() => {
    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [pedidoRes, configRes] = await Promise.all([
        pedidosAPI.obtenerPorId(pedidoId),
        configAPI.obtenerDatosPago()
      ]);
      
      setPedido(pedidoRes.data.data);
      setDatosPago(configRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar información del pedido');
    } finally {
      setCargando(false);
    }
  };

  const calcularPropinaTotal = () => {
    if (propinaPersonalizada) {
      return parseFloat(propinaPersonalizada) || 0;
    }
    return calcularPropina(pedido.total, propinaPorcentaje);
  };

  const calcularTotalConPropina = () => {
    return pedido.total + calcularPropinaTotal();
  };

  const copiarAlPortapapeles = (texto, campo) => {
    navigator.clipboard.writeText(texto);
    setCopiado(campo);
    setTimeout(() => setCopiado(''), 2000);
  };

  const handleArchivoChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      // Validar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      setComprobante(archivo);

      // Crear previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrevisualizacion(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  const handleProcesarPago = async () => {
    if (!metodoPago) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    // Validar comprobante para métodos digitales (no incluye biopago ni punto_venta)
    if (['pago_movil', 'transferencia', 'zelle'].includes(metodoPago)) {
      if (!comprobante) {
        alert('Por favor adjunta el comprobante de pago');
        return;
      }
      if (!referencia.trim()) {
        alert('Por favor ingresa el número de referencia');
        return;
      }
    }

    try {
      setProcesando(true);
      
      const formData = {
        metodoPago,
        propina: calcularPropinaTotal(),
        referenciaPago: referencia
      };

      // Si hay comprobante, convertirlo a base64
      if (comprobante) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            formData.comprobantePago = reader.result;
            
            await pedidosAPI.procesarPago(pedidoId, formData);
            alert('¡Pago enviado exitosamente!\n\nTu pago está siendo procesado. El personal verificará la información y confirmará tu pago en breve.');
            navigate('/mis-pedidos');
          } catch (err) {
            console.error('Error al procesar pago con comprobante:', err);
            const mensaje = err.response?.data?.message || 'Error al procesar el pago';
            alert(`Error: ${mensaje}\n\nIntenta con una imagen más pequeña.`);
          } finally {
            setProcesando(false);
          }
        };
        reader.onerror = () => {
          alert('Error al leer la imagen. Por favor intenta de nuevo.');
          setProcesando(false);
        };
        reader.readAsDataURL(comprobante);
      } else {
        await pedidosAPI.procesarPago(pedidoId, formData);
        const mensajes = {
          'efectivo': '¡Método de pago registrado!\n\nPuedes acercarte a la caja para realizar el pago en efectivo.',
          'biopago': '¡Método de pago registrado!\n\nPuedes acercarte a la caja para pagar con BioPago (huella digital).',
          'punto_venta': '¡Método de pago registrado!\n\nEl personal se acercará a tu mesa con el punto de venta.',
          'default': '¡Pago registrado exitosamente!\n\nEl personal verificará tu pago en breve.'
        };
        alert(mensajes[metodoPago] || mensajes.default);
        navigate('/mis-pedidos');
        setProcesando(false);
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      const mensaje = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al procesar el pago: ${mensaje}`);
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pedido no encontrado
          </h2>
          <button onClick={() => navigate('/mis-pedidos')} className="btn-primary">
            Volver a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  if (pedido.pagado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Check size={80} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Este pedido ya fue pagado
          </h2>
          <button onClick={() => navigate('/mis-pedidos')} className="btn-primary">
            Volver a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-32">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/mis-pedidos')}
            className="p-2 hover:bg-primary-50 rounded-xl transition-all transform hover:scale-110 active:scale-95"
          >
            <ArrowLeft size={24} className="text-primary-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="text-primary-600" size={28} />
              Pagar Pedido
            </h1>
            <p className="text-sm text-gray-500">Completa tu pago de forma segura</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 transform hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <CheckCircle className="text-primary-600" size={20} />
            </div>
            <h2 className="font-bold text-xl text-gray-800">Resumen del Pedido</h2>
          </div>
          <div className="space-y-3">
            {pedido.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {item.cantidad}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {item.nombreProducto}
                  </span>
                </div>
                <span className="text-gray-900 font-bold">
                  {formatearPrecio(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
              <span className="text-2xl font-bold text-primary-600">{formatearPrecio(pedido.total)}</span>
            </div>
          </div>
        </div>

        {/* Propina */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 transform hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Gift className="text-yellow-600" size={20} />
            </div>
            <h2 className="font-bold text-xl text-gray-800">Propina (Opcional)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Tu propina ayuda a nuestro equipo 💛</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[0, 10, 15, 20].map(porcentaje => (
              <button
                key={porcentaje}
                onClick={() => {
                  setPropinaPorcentaje(porcentaje);
                  setPropinaPersonalizada('');
                }}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  propinaPorcentaje === porcentaje && !propinaPersonalizada
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {porcentaje}%
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Monto personalizado"
            value={propinaPersonalizada}
            onChange={(e) => {
              setPropinaPersonalizada(e.target.value);
              setPropinaPorcentaje(0);
            }}
            className="input-field"
          />
          <div className="mt-3 text-sm text-gray-600">
            Propina: <span className="font-semibold">{formatearPrecio(calcularPropinaTotal())}</span>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="card p-4 mb-6">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">Método de Pago</h2>
          
          <div className="space-y-3">
            {/* Pago Móvil */}
            <button
              onClick={() => setMetodoPago('pago_movil')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                metodoPago === 'pago_movil'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone size={24} className="text-primary-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Pago Móvil</div>
                  {metodoPago === 'pago_movil' && datosPago && (
                    <div className="mt-2 text-sm space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">CI: {datosPago.pagoMovil.ci}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            copiarAlPortapapeles(datosPago.pagoMovil.ci, 'ci');
                          }}
                          className="text-primary-600 hover:text-primary-700 cursor-pointer"
                        >
                          {copiado === 'ci' ? <Check size={16} /> : <Copy size={16} />}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Teléfono: {datosPago.pagoMovil.telefono}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            copiarAlPortapapeles(datosPago.pagoMovil.telefono, 'telefono');
                          }}
                          className="text-primary-600 hover:text-primary-700 cursor-pointer"
                        >
                          {copiado === 'telefono' ? <Check size={16} /> : <Copy size={16} />}
                        </span>
                      </div>
                      <div className="text-gray-600">Banco: {datosPago.pagoMovil.banco}</div>
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Transferencia */}
            <button
              onClick={() => setMetodoPago('transferencia')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                metodoPago === 'transferencia'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={24} className="text-primary-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">Transferencia Bancaria</div>
                  {metodoPago === 'transferencia' && datosPago && (
                    <div className="mt-2 text-sm space-y-1">
                      <div className="text-gray-600">{datosPago.transferencia.banco}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cuenta: {datosPago.transferencia.cuenta}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            copiarAlPortapapeles(datosPago.transferencia.cuenta, 'cuenta');
                          }}
                          className="text-primary-600 hover:text-primary-700 cursor-pointer"
                        >
                          {copiado === 'cuenta' ? <Check size={16} /> : <Copy size={16} />}
                        </span>
                      </div>
                      <div className="text-gray-600">{datosPago.transferencia.titular}</div>
                      <div className="text-gray-600">RIF: {datosPago.transferencia.rif}</div>
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Efectivo */}
            <button
              onClick={() => setMetodoPago('efectivo')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                metodoPago === 'efectivo'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign size={24} className="text-primary-600" />
                <div>
                  <div className="font-semibold text-gray-800">Efectivo (Dólares)</div>
                  <div className="text-sm text-gray-600">Pagar en caja</div>
                </div>
              </div>
            </button>

            {/* BioPago */}
            <button
              onClick={() => setMetodoPago('biopago')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                metodoPago === 'biopago'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Fingerprint size={24} className="text-primary-600" />
                <div>
                  <div className="font-semibold text-gray-800">BioPago</div>
                  <div className="text-sm text-gray-600">Pagar en caja con huella digital</div>
                </div>
              </div>
            </button>

            {/* Zelle */}
            {datosPago?.zelle?.email && (
              <button
                onClick={() => setMetodoPago('zelle')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  metodoPago === 'zelle'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={24} className="text-primary-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">Zelle</div>
                    {metodoPago === 'zelle' && (
                      <div className="mt-2 text-sm flex justify-between items-center">
                        <span className="text-gray-600">{datosPago.zelle.email}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            copiarAlPortapapeles(datosPago.zelle.email, 'zelle');
                          }}
                          className="text-primary-600 hover:text-primary-700 cursor-pointer"
                        >
                          {copiado === 'zelle' ? <Check size={16} /> : <Copy size={16} />}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )}

            {/* Punto de Venta */}
            <button
              onClick={() => setMetodoPago('punto_venta')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                metodoPago === 'punto_venta'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={24} className="text-primary-600" />
                <div>
                  <div className="font-semibold text-gray-800">Punto de Venta</div>
                  <div className="text-sm text-gray-600">Solicitar a la mesa</div>
                </div>
              </div>
            </button>
          </div>

          {/* Sección de comprobante y referencia (solo para métodos digitales) */}
          {['pago_movil', 'transferencia', 'zelle'].includes(metodoPago) && (
            <div className="card p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Adjuntar Comprobante de Pago
              </h3>
              
              {/* Número de referencia */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Referencia *
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: 123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Carga de archivo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Captura del Comprobante *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArchivoChange}
                    className="hidden"
                    id="comprobante-input"
                  />
                  <label htmlFor="comprobante-input" className="cursor-pointer">
                    {previsualizacion ? (
                      <div>
                        <img
                          src={previsualizacion}
                          alt="Comprobante"
                          className="max-w-full max-h-64 mx-auto rounded-lg mb-2"
                        />
                        <p className="text-sm text-primary-600">Clic para cambiar imagen</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-gray-400 mb-2">
                          <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Clic para seleccionar una imagen
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG hasta 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📸 Toma una captura de pantalla del comprobante de tu banco o aplicación de pago
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer fijo con total */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>{formatearPrecio(pedido.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Propina:</span>
              <span>{formatearPrecio(calcularPropinaTotal())}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-lg font-semibold text-gray-700">Total a Pagar:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatearPrecio(calcularTotalConPropina())}
              </span>
            </div>
          </div>
          <button
            onClick={handleProcesarPago}
            disabled={!metodoPago || procesando}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pago;
