import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMesa } from '../../context/MesaContext';
import { Coffee, Hash } from 'lucide-react';

/**
 * Componente para escanear QR o ingresar número de mesa manualmente
 */
const EscanearQR = () => {
  const navigate = useNavigate();
  const { conectarMesa, cargando } = useMesa();
  const [numeroMesa, setNumeroMesa] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-4">
            <Coffee className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-2 tracking-wider">
            SIERRA YARA
          </h1>
          <p className="text-accent-200 text-xl font-elegant tracking-widest">
            C A F É
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Bienvenido
          </h2>

          <form onSubmit={handleConectar} className="space-y-4">
            {/* Número de mesa */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Número de Mesa *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  placeholder="Ej: 5"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Nombre (opcional) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Tu Nombre (opcional)
              </label>
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ej: Juan"
                className="input-field"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ayuda a identificar tu pedido en la mesa
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Conectando...' : 'Acceder al Menú'}
            </button>
          </form>

          {/* Instrucciones */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              ¿Cómo funciona?
            </h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Ingresa el número de tu mesa</li>
              <li>Explora nuestro menú digital</li>
              <li>Agrega productos a tu carrito</li>
              <li>Confirma tu pedido</li>
              <li>Paga cuando estés listo</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-primary-100 text-sm">
          <p>© 2024 Sierra Yara Café</p>
          <p>Yaracuy, Venezuela</p>
        </div>
      </div>
    </div>
  );
};

export default EscanearQR;
