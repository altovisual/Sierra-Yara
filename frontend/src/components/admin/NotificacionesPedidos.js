import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Drawer, List, Button, Tag, Empty, Typography } from 'antd';
import { BellOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import socketService from '../../services/socket';
import { formatearPrecio } from '../../utils/helpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

const { Text } = Typography;

dayjs.extend(relativeTime);
dayjs.locale('es');

/**
 * Componente de notificaciones de pedidos en tiempo real
 */
const NotificacionesPedidos = ({ onVerPedido }) => {
  const [visible, setVisible] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [sonidoActivado, setSonidoActivado] = useState(true);

  // Cargar notificaciones del localStorage
  useEffect(() => {
    const notificacionesGuardadas = localStorage.getItem('notificaciones_admin');
    if (notificacionesGuardadas) {
      setNotificaciones(JSON.parse(notificacionesGuardadas));
    }

    const sonidoGuardado = localStorage.getItem('sonido_notificaciones');
    if (sonidoGuardado !== null) {
      setSonidoActivado(JSON.parse(sonidoGuardado));
    }
  }, []);

  // Guardar notificaciones en localStorage
  useEffect(() => {
    localStorage.setItem('notificaciones_admin', JSON.stringify(notificaciones));
  }, [notificaciones]);

  const reproducirSonido = useCallback(() => {
    if (!sonidoActivado) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Segundo beep
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.value = 1100;
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.3);
      }, 200);
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }, [sonidoActivado]);

  const agregarNotificacion = useCallback((tipo, data) => {
    const nuevaNotificacion = {
      id: Date.now(),
      tipo,
      data,
      fecha: new Date().toISOString(),
      leida: false
    };

    setNotificaciones(prev => [nuevaNotificacion, ...prev].slice(0, 50)); // Mantener máximo 50
    reproducirSonido();

    // Mostrar notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sierra Yara Café', {
        body: tipo === 'pedido' 
          ? `Nuevo pedido en Mesa ${data.numeroMesa}` 
          : `Mesa ${data.numeroMesa} solicita atención`,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: `notificacion-${nuevaNotificacion.id}`
      });
    }
  }, [reproducirSonido]);

  useEffect(() => {
    // Solicitar permiso para notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Conectar al socket
    socketService.connect();

    // Listeners
    const handleNuevoPedido = (data) => {
      agregarNotificacion('pedido', data);
    };

    const handleMesoneroSolicitado = (data) => {
      agregarNotificacion('mesonero', data);
    };

    socketService.onNuevoPedidoAdmin(handleNuevoPedido);
    socketService.onMesoneroSolicitado(handleMesoneroSolicitado);

    return () => {
      socketService.off('pedido_nuevo_admin', handleNuevoPedido);
      socketService.off('mesonero_solicitado', handleMesoneroSolicitado);
    };
  }, [agregarNotificacion]);

  const marcarComoLeida = (id) => {
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const limpiarTodas = () => {
    setNotificaciones([]);
  };

  const toggleSonido = () => {
    const nuevoEstado = !sonidoActivado;
    setSonidoActivado(nuevoEstado);
    localStorage.setItem('sonido_notificaciones', JSON.stringify(nuevoEstado));
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <>
      <Badge count={notificacionesNoLeidas} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '20px' }} />}
          onClick={() => setVisible(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </Badge>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <BellOutlined style={{ marginRight: '8px' }} />
              Notificaciones ({notificacionesNoLeidas})
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="small"
                onClick={toggleSonido}
                type={sonidoActivado ? 'primary' : 'default'}
              >
                {sonidoActivado ? '🔔' : '🔕'}
              </Button>
              {notificaciones.length > 0 && (
                <>
                  <Button size="small" onClick={marcarTodasComoLeidas}>
                    Marcar todas
                  </Button>
                  <Button size="small" danger onClick={limpiarTodas}>
                    Limpiar
                  </Button>
                </>
              )}
            </div>
          </div>
        }
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={400}
      >
        {notificaciones.length === 0 ? (
          <Empty
            description="No hay notificaciones"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notificaciones}
            renderItem={(notif) => (
              <List.Item
                style={{
                  background: notif.leida ? '#fff' : '#e6f7ff',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: notif.leida ? '1px solid #f0f0f0' : '1px solid #91d5ff',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  marcarComoLeida(notif.id);
                  // Emitir evento personalizado para que el Dashboard abra el modal
                  const event = new CustomEvent('abrirPedidoDesdeNotificacion', {
                    detail: { pedidoId: notif.pedidoId }
                  });
                  window.dispatchEvent(event);
                  setVisible(false);
                }}
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      marcarComoLeida(notif.id);
                    }}
                    disabled={notif.leida}
                  />,
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarNotificacion(notif.id);
                    }}
                  />
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag color={notif.tipo === 'pedido' ? 'red' : 'orange'}>
                        {notif.tipo === 'pedido' ? '🍽️ Pedido' : '🔔 Mesonero'}
                      </Tag>
                      <Text strong>Mesa {notif.data.numeroMesa}</Text>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: '4px' }}>
                        {notif.tipo === 'pedido' ? (
                          <>
                            <Text>Nuevo pedido</Text>
                            {notif.data.total && (
                              <Text strong style={{ marginLeft: '8px', color: '#52c41a' }}>
                                {formatearPrecio(notif.data.total)}
                              </Text>
                            )}
                          </>
                        ) : (
                          <Text>Solicita atención</Text>
                        )}
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(notif.fecha).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};

export default NotificacionesPedidos;
