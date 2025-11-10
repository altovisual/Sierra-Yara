import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';
import { Hash, ChevronRight, User, CreditCard, Phone } from 'lucide-react';
import logo from '../../assets/logo.png';

/**
 * Componente para escanear QR o ingresar número de mesa manualmente
 */
const EscanearQR = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { numeroMesa: mesaParam } = useParams();
  const { conectarMesa, desconectarMesa, cargando, estaConectado, mesaActual } = useMesa();
  
  const [numeroMesa, setNumeroMesa] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [apellidoUsuario, setApellidoUsuario] = useState('');
  const [cedulaUsuario, setCedulaUsuario] = useState('');
  const [telefonoUsuario, setTelefonoUsuario] = useState('');
  const [error, setError] = useState('');
  const [animado, setAnimado] = useState(false);
  const [mesaDesdeQR, setMesaDesdeQR] = useState(null);

  useEffect(() => {
    // Activar animación al montar el componente
    setTimeout(() => setAnimado(true), 100);
    
    // Obtener número de mesa desde URL (parámetro de ruta o query param)
    const mesaDesdeRuta = mesaParam || searchParams.get('mesa');
    
    console.log('🔍 DEBUG - mesaParam:', mesaParam);
    console.log('🔍 DEBUG - searchParams.get("mesa"):', searchParams.get('mesa'));
    console.log('🔍 DEBUG - mesaDesdeRuta:', mesaDesdeRuta);
    
    // Si hay número de mesa en la URL
    if (mesaDesdeRuta) {
      console.log('📱 QR escaneado - Mesa:', mesaDesdeRuta);
      
      // Si ya está conectado a una mesa DIFERENTE, limpiar sesión
      if (estaConectado() && mesaActual && mesaActual.numeroMesa !== parseInt(mesaDesdeRuta)) {
        console.log('🔄 Cambiando de mesa', mesaActual.numeroMesa, '→', mesaDesdeRuta);
        console.log('🧹 Limpiando sesión anterior...');
        desconectarMesa();
      }
      // Si está conectado a la MISMA mesa, redirigir al menú
      else if (estaConectado() && mesaActual && mesaActual.numeroMesa === parseInt(mesaDesdeRuta)) {
        console.log('✅ Ya conectado a esta mesa, redirigiendo al menú...');
        navigate('/menu', { replace: true });
        return;
      }
      
      // Establecer que viene desde QR
      console.log('✅ Estableciendo mesaDesdeQR:', mesaDesdeRuta);
      setMesaDesdeQR(mesaDesdeRuta);
      setNumeroMesa(mesaDesdeRuta);
    } else {
      console.log('❌ No hay mesa en la URL');
      setMesaDesdeQR(null);
      setNumeroMesa('');
      
      // Solo si NO hay mesa en URL Y ya está conectado, redirigir al menú
      if (estaConectado()) {
        console.log('✅ Usuario ya conectado, redirigiendo al menú...');
        navigate('/menu', { replace: true });
      }
    }
  }, [mesaParam, searchParams, estaConectado, mesaActual, desconectarMesa, navigate]);

  const handleConectar = async (e) => {
    e.preventDefault();
    setError('');

    if (!numeroMesa || numeroMesa < 1) {
      setError('Por favor ingresa un número de mesa válido');
      return;
    }

    if (!nombreUsuario.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!apellidoUsuario.trim()) {
      setError('Por favor ingresa tu apellido');
      return;
    }

    if (!cedulaUsuario.trim()) {
      setError('Por favor ingresa tu cédula de identidad');
      return;
    }

    if (!telefonoUsuario.trim()) {
      setError('Por favor ingresa tu número de teléfono');
      return;
    }

    // Validar formato de cédula (solo números, mínimo 6 dígitos)
    if (!/^\d{6,}$/.test(cedulaUsuario.replace(/[.-]/g, ''))) {
      setError('La cédula debe contener al menos 6 dígitos');
      return;
    }

    // Validar formato de teléfono (solo números, mínimo 10 dígitos)
    if (!/^\d{10,}$/.test(telefonoUsuario.replace(/[\s()-]/g, ''))) {
      setError('El teléfono debe contener al menos 10 dígitos');
      return;
    }

    try {
      const nombreCompleto = `${nombreUsuario.trim()} ${apellidoUsuario.trim()}`;
      const datosCliente = {
        nombre: nombreCompleto,
        cedula: cedulaUsuario.trim(),
        telefono: telefonoUsuario.trim()
      };
      
      await conectarMesa(parseInt(numeroMesa), nombreCompleto, datosCliente);
      navigate('/menu');
    } catch (err) {
      console.error('Error completo:', err);
      
      // Mensajes de error más específicos
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('⏱️ Tiempo de espera agotado. Verifica que el servidor esté corriendo.');
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('🌐 No se puede conectar al servidor. Verifica tu conexión WiFi y que el backend esté corriendo.');
      } else if (err.response?.status === 404) {
        setError('❌ Mesa no encontrada. Verifica el número de mesa.');
      } else {
        setError(err.response?.data?.error || '❌ Error al conectar a la mesa. Revisa la consola para más detalles.');
      }
    }
  };

  // Log para debugging en el render
  console.log('🎨 RENDER - mesaDesdeQR:', mesaDesdeQR);
  console.log('🎨 RENDER - numeroMesa:', numeroMesa);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`max-w-md w-full relative z-10 transition-all duration-1000 transform ${
        animado ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
            <div className="relative p-5 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <img 
                src={logo} 
                alt="Sierra Yara Logo" 
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-6xl font-display font-bold text-white mb-3 tracking-wider drop-shadow-2xl animate-fade-in">
            SIERRA YARA
          </h1>
          <p className="text-accent-100 text-2xl font-elegant tracking-widest mb-2 drop-shadow-lg">
            C A F É
          </p>
          <p className="text-white/70 text-sm tracking-wide">
            ✨ Menú Digital Interactivo ✨
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 transform hover:shadow-3xl transition-all duration-300">
          <div className="text-center mb-6">
            {mesaDesdeQR ? (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  ¡Bienvenido! 👋
                </h2>
                <div className="mt-3 mb-4">
                  <p className="text-gray-600 text-sm mb-2">Conectándote a la</p>
                  <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-5 py-3 rounded-xl font-bold text-xl shadow-md">
                    <Hash size={22} />
                    Mesa {mesaDesdeQR}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  Por favor completa tus datos para continuar
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  ¡Bienvenido! 👋
                </h2>
                <p className="text-gray-600 text-sm">
                  Ingresa tu mesa para comenzar
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleConectar} className="space-y-4">
            {/* Número de mesa - Solo si NO viene desde QR */}
            {!mesaDesdeQR && (
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Hash size={18} className="text-primary-600" />
                  Número de Mesa *
                </label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={22} />
                  <input
                    type="number"
                    min="1"
                    value={numeroMesa}
                    onChange={(e) => setNumeroMesa(e.target.value)}
                    placeholder="Ej: 5"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all text-lg font-semibold text-gray-800 hover:border-gray-300"
                    required
                  />
                </div>
              </div>
            )}

            {/* Nombre */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <User size={18} className="text-primary-600" />
                Nombre *
              </label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ej: Juan"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all hover:border-gray-300"
                required
              />
            </div>

            {/* Apellido */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <User size={18} className="text-primary-600" />
                Apellido *
              </label>
              <input
                type="text"
                value={apellidoUsuario}
                onChange={(e) => setApellidoUsuario(e.target.value)}
                placeholder="Ej: Pérez"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all hover:border-gray-300"
                required
              />
            </div>

            {/* Cédula de Identidad */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <CreditCard size={18} className="text-primary-600" />
                Cédula de Identidad *
              </label>
              <input
                type="text"
                value={cedulaUsuario}
                onChange={(e) => setCedulaUsuario(e.target.value)}
                placeholder="Ej: 12345678"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all hover:border-gray-300"
                required
              />
            </div>

            {/* Número de Teléfono */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                <Phone size={18} className="text-primary-600" />
                Número de Teléfono *
              </label>
              <input
                type="tel"
                value={telefonoUsuario}
                onChange={(e) => setTelefonoUsuario(e.target.value)}
                placeholder="Ej: 04121234567"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all hover:border-gray-300"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl animate-shake shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span className="flex-1">{error}</span>
                </div>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="relative w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative flex items-center justify-center gap-2 text-lg">
                {cargando ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Conectando...
                  </>
                ) : (
                  <>
                    Acceder al Menú
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Instrucciones */}
          <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📱</span>
              ¿Cómo funciona?
            </h3>
            <div className="space-y-2">
              {mesaDesdeQR ? (
                <>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    <span>Ingresa tu nombre</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    <span>Explora nuestro menú digital</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    <span>Agrega productos a tu carrito</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                    <span>Confirma tu pedido</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">5</span>
                    <span>Paga cuando estés listo 💳</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    <span>Ingresa el número de tu mesa</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    <span>Explora nuestro menú digital</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    <span>Agrega productos a tu carrito</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                    <span>Confirma tu pedido</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">5</span>
                    <span>Paga cuando estés listo 💳</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm space-y-1">
          <p className="font-semibold">© 2024 Sierra Yara Café</p>
          <p className="flex items-center justify-center gap-1">
            <span>📍</span>
            Yaracuy, Venezuela
          </p>
          <p className="text-white/60 text-xs mt-2">Hecho con ❤️ para nuestros clientes</p>
        </div>
      </div>
    </div>
  );
};

export default EscanearQR;
