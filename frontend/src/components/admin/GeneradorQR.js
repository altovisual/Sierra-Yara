import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import AdminLayout from './AdminLayout';

/**
 * Componente para generar códigos QR de las mesas
 */
const GeneradorQR = () => {
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState([1, 2, 3, 4, 5, 6]);
  const [usarIPLocal, setUsarIPLocal] = useState(true);
  
  // Obtener URL base según configuración
  const getBaseUrl = () => {
    if (usarIPLocal) {
      return 'http://192.168.101.15:3000';
    }
    return window.location.origin;
  };
  
  const baseUrl = getBaseUrl();

  const handleToggleMesa = (numeroMesa) => {
    if (mesasSeleccionadas.includes(numeroMesa)) {
      setMesasSeleccionadas(mesasSeleccionadas.filter(m => m !== numeroMesa));
    } else {
      setMesasSeleccionadas([...mesasSeleccionadas, numeroMesa].sort((a, b) => a - b));
    }
  };

  const handleDescargarQR = (numeroMesa) => {
    const svg = document.getElementById(`qr-mesa-${numeroMesa}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Mesa-${numeroMesa}-SierraYara.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleImprimirTodos = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Generador de Códigos QR</h2>
        <p className="text-gray-600">Genera códigos QR para que los clientes accedan al menú desde sus mesas</p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-blue-800">
                <strong>URL Base:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{baseUrl}</code>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Los clientes escanearán el QR y serán dirigidos a /mesa/[número]
              </p>
            </div>
            <button
              onClick={() => setUsarIPLocal(!usarIPLocal)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {usarIPLocal ? '📱 IP Local' : '💻 Localhost'}
            </button>
          </div>
          <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
            {usarIPLocal ? (
              <span>✓ Usando IP local - Los QR funcionarán en celulares de la red</span>
            ) : (
              <span>⚠️ Usando localhost - Los QR solo funcionarán en esta computadora</span>
            )}
          </div>
        </div>
      </div>

      {/* Selector de mesas */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Seleccionar Mesas:</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <button
              key={num}
              onClick={() => handleToggleMesa(num)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mesasSeleccionadas.includes(num)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mesa {num}
            </button>
          ))}
        </div>
      </div>

      {/* Botón de imprimir todos */}
      <div className="mb-6">
        <button
          onClick={handleImprimirTodos}
          className="btn-primary flex items-center gap-2"
        >
          <Printer size={20} />
          Imprimir Todos los QR Seleccionados
        </button>
      </div>

      {/* Grid de QR Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
        {mesasSeleccionadas.map(numeroMesa => {
          const url = `${baseUrl}/mesa/${numeroMesa}`;
          
          return (
            <div key={numeroMesa} className="card p-6 text-center break-inside-avoid">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Mesa {numeroMesa}
              </h3>
              <p className="text-sm text-gray-600 mb-4">Sierra Yara Café</p>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG
                  id={`qr-mesa-${numeroMesa}`}
                  value={url}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              {/* URL */}
              <div className="mt-4 text-xs text-gray-500 break-all">
                {url}
              </div>
              
              {/* Botón de descarga (oculto en impresión) */}
              <button
                onClick={() => handleDescargarQR(numeroMesa)}
                className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2 mx-auto print:hidden"
              >
                <Download size={16} />
                Descargar PNG
              </button>
            </div>
          );
        })}
      </div>

      {/* Instrucciones para imprimir */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 print:hidden">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Instrucciones:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Selecciona las mesas que deseas generar</li>
          <li>2. Haz clic en "Imprimir Todos" o descarga individualmente</li>
          <li>3. Coloca los códigos QR en las mesas correspondientes</li>
          <li>4. Los clientes escanearán el QR para acceder al menú</li>
        </ul>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:grid-cols-2,
          .print\\:grid-cols-2 * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
      </div>
    </AdminLayout>
  );
};

export default GeneradorQR;
