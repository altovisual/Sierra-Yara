import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * Modal de confirmación personalizado con diseño Sierra Yara
 */
const ModalConfirmacion = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensaje, 
  textoConfirmar = 'Aceptar',
  textoCancelar = 'Cancelar',
  tipo = 'warning' // warning, danger, info
}) => {
  if (!isOpen) return null;

  const colores = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      btnConfirmar: 'bg-yellow-600 hover:bg-yellow-700'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      btnConfirmar: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      btnConfirmar: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const estilo = colores[tipo];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
        {/* Header */}
        <div className={`${estilo.bg} ${estilo.border} border-b-2 p-6 rounded-t-2xl`}>
          <div className="flex items-start gap-4">
            <div className={`${estilo.icon} flex-shrink-0`}>
              <AlertCircle size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
                {titulo}
              </h3>
              <p className="text-gray-700">
                {mensaje}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {textoCancelar}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 ${estilo.btnConfirmar} text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
