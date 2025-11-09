import React from 'react';
import { useTasaBCV } from '../../context/TasaBCVContext';
import { TrendingUp, RefreshCw } from 'lucide-react';

/**
 * Componente que muestra la tasa BCV actual
 */
const IndicadorTasa = ({ compact = false }) => {
  const { tasa, ultimaActualizacion, fuente, cargando, cargarTasa } = useTasaBCV();

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const hoy = new Date();
    const esHoy = date.toDateString() === hoy.toDateString();
    
    if (esHoy) {
      return `Hoy ${date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('es-VE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        fontSize: '12px',
        color: 'white',
        fontWeight: '600'
      }}>
        <TrendingUp size={14} />
        <span>Bs. {tasa.toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '16px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
              Tasa BCV
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {cargando ? '...' : `Bs. ${tasa.toFixed(2)}`}
            </div>
          </div>
        </div>
        
        <button
          onClick={cargarTasa}
          disabled={cargando}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            color: 'white',
            cursor: cargando ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => !cargando && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
        >
          <RefreshCw size={18} style={{ 
            animation: cargando ? 'spin 1s linear infinite' : 'none'
          }} />
        </button>
      </div>
      
      {ultimaActualizacion && (
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.8, 
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>Actualizada: {formatearFecha(ultimaActualizacion)}</span>
          <span>•</span>
          <span>{fuente === 'api' ? 'Automática' : 'Manual'}</span>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default IndicadorTasa;
