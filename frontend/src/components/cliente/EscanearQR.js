import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';
import { Hash, Sparkles, ChevronRight } from 'lucide-react';
import logo from '../../assets/logo.png';

/**
 * Componente para escanear QR o ingresar número de mesa manualmente
 */
const EscanearQR = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conectarMesa, cargando, estaConectado } = useMesa();
  const [numeroMesa, setNumeroMesa] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [error, setError] = useState('');
  const [animado, setAnimado] = useState(false);
  const [mesaDesdeQR, setMesaDesdeQR] = useState(null);

  useEffect(() => {
    // Activar animación al montar el componente
    setTimeout(() => setAnimado(true), 100);
    
    // Si ya está conectado a una mesa, redirigir al menú
    if (estaConectado()) {
      console.log('✅ Usuario ya conectado, redirigiendo al menú...');
      navigate('/menu', { replace: true });
      return;
    }
    
    // Obtener número de mesa desde URL (QR)
    const mesaParam = searchParams.get('mesa');
    if (mesaParam) {
      setMesaDesdeQR(mesaParam);
      setNumeroMesa(mesaParam);
    }
  }, [searchParams, estaConectado, navigate]);

  const handleConectar = async (e) => {
    e.preventDefault();
    setError('');

    if (!numeroMesa || numeroMesa < 1) {
      setError('Por favor ingresa un número de mesa válido');
      return;
    }

    try {
      await conectarMesa(parseInt(numeroMesa), nombreUsuario);
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
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-bounce" />
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
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenido! 👋
            </h2>
            {mesaDesdeQR ? (
              <div className="mt-3">
                <p className="text-gray-600 text-sm mb-2">Estás en la</p>
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-bold text-lg">
                  <Hash size={20} />
                  Mesa {mesaDesdeQR}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">
                Ingresa tu mesa para comenzar
              </p>
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
                <Sparkles size={18} className="text-primary-600" />
                Tu Nombre {mesaDesdeQR ? '*' : '(opcional)'}
              </label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ej: Juan"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all text-lg hover:border-gray-300"
                required={mesaDesdeQR}
              />
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <span>💡</span>
                {mesaDesdeQR ? 'Ayúdanos a identificar tu pedido' : 'Ayuda a identificar tu pedido en la mesa'}
              </p>
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
