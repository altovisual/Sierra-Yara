import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

/**
 * Spinner de carga personalizado
 */
export const LoadingSpinner = ({ size = 'default', tip = 'Cargando...', fullscreen = false }) => {
  const sizeMap = {
    small: 24,
    default: 40,
    large: 60
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: sizeMap[size],
        color: '#1890ff'
      }}
      spin
    />
  );

  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}
      >
        <Spin indicator={antIcon} size={size} />
        {tip && (
          <p style={{
            marginTop: '16px',
            fontSize: '16px',
            color: '#1890ff',
            fontWeight: 500
          }}>
            {tip}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        minHeight: '200px'
      }}
    >
      <Spin indicator={antIcon} size={size} tip={tip} />
    </div>
  );
};

/**
 * Loader con animación de pulso
 */
export const PulseLoader = () => (
  <div
    style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#1890ff',
          animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes pulse {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

/**
 * Loader de barras
 */
export const BarLoader = () => (
  <div
    style={{
      display: 'flex',
      gap: '4px',
      alignItems: 'flex-end',
      justifyContent: 'center',
      height: '40px',
      padding: '20px'
    }}
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          width: '6px',
          background: '#1890ff',
          borderRadius: '3px',
          animation: `bar-bounce 1s ease-in-out ${i * 0.1}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes bar-bounce {
        0%, 100% {
          height: 10px;
        }
        50% {
          height: 40px;
        }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;
