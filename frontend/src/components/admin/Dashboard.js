import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { mesasAPI, pedidosAPI } from '../../services/api';
import socketService from '../../services/socket';
import { formatearPrecio, obtenerTextoEstado } from '../../utils/helpers';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { StatCardSkeleton } from '../common/SkeletonLoaders';
import {
  ShoppingOutlined,
  TableOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  Card,
  Button,
  message,
  Row,
  Col,
  Typography,
  Tag,
  Empty,
  Modal,
  Tooltip,
  Select,
  Popconfirm
} from 'antd';
import AdminLayout from './AdminLayout';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

const { Text } = Typography;

dayjs.extend(relativeTime);
dayjs.locale('es');

/**
 * Panel de administración para gestionar mesas y pedidos
 */
const Dashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    mesasOcupadas: 0,
    pedidosActivos: 0,
    totalVentas: 0,
    pedidosHoy: 0,
    pedidosPendientes: 0
  });
  const [ventasDia, setVentasDia] = useState(null);
  const [mostrarAtajos, setMostrarAtajos] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [modalMesaVisible, setModalMesaVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalPedidoVisible, setModalPedidoVisible] = useState(false);

  // Obtener los últimos pedidos
  const ultimosPedidos = useMemo(() => {
    return [...pedidos]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map(pedido => ({
        ...pedido,
        fechaFormateada: dayjs(pedido.fecha).format('DD/MM/YYYY HH:mm')
      }));
  }, [pedidos]);

  const cargarDatos = useCallback(async () => {
    try {
      setCargandoInicial(true);
      const [mesasRes, pedidosRes, ventasRes] = await Promise.all([
        mesasAPI.obtenerTodas(),
        pedidosAPI.obtenerTodos(),
        pedidosAPI.obtenerEstadisticasDia()
      ]);

      const mesasData = mesasRes.data.data || [];
      const pedidosData = pedidosRes.data.data || [];

      // Ordenar mesas por número
      const mesasOrdenadas = [...mesasData].sort((a, b) => a.numero - b.numero);
      
      setMesas(mesasOrdenadas);
      setPedidos(pedidosData);

      // Guardar estadísticas de ventas del día
      if (ventasRes && ventasRes.data && ventasRes.data.data) {
        setVentasDia(ventasRes.data.data);
      }

      // Calcular estadísticas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const mesasOcupadas = mesasData.filter(m => m.estado === 'ocupada');
      const pedidosActivos = pedidosData.filter(p => 
        !['entregado', 'cancelado'].includes(p.estado)
      );
      
      const pedidosHoy = pedidosData.filter(p => 
        new Date(p.fecha) >= hoy
      ).length;
      
      const totalVentas = pedidosData
        .filter(p => p.pagado && new Date(p.fecha) >= hoy)
        .reduce((sum, p) => sum + (p.total || 0) + (p.propina || 0), 0);

      setEstadisticas({ 
        mesasOcupadas: mesasOcupadas.length, 
        pedidosActivos: pedidosActivos.length,
        pedidosPendientes: pedidosActivos.filter(p => p.estado === 'pendiente').length,
        totalVentas,
        pedidosHoy
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setCargandoInicial(false);
    }
  }, []);

  const agregarNotificacion = useCallback((mensaje) => {
    message.info(mensaje);
  }, []);

  // Abrir modal de mesa con detalles
  const verDetalleMesa = useCallback((mesa) => {
    setMesaSeleccionada(mesa);
    setModalMesaVisible(true);
  }, []);

  // Abrir modal de pedido con detalles
  const verDetallePedido = useCallback((pedido) => {
    setPedidoSeleccionado(pedido);
    setModalPedidoVisible(true);
  }, []);

  // Cambiar estado del pedido
  const cambiarEstado = useCallback(async (pedidoId, nuevoEstado) => {
    try {
      await pedidosAPI.actualizarEstado(pedidoId, nuevoEstado);
      message.success(`Pedido actualizado a: ${obtenerTextoEstado(nuevoEstado)}`);
      cargarDatos();
      if (pedidoSeleccionado && pedidoSeleccionado._id === pedidoId) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado });
      }
    } catch (err) {
      message.error('Error al actualizar estado del pedido');
      console.error(err);
    }
  }, [pedidoSeleccionado, cargarDatos]);

  // Confirmar pago del pedido
  const confirmarPago = useCallback(async (pedidoId) => {
    try {
      await pedidosAPI.confirmarPago(pedidoId);
      message.success('Pago confirmado exitosamente');
      cargarDatos();
      if (pedidoSeleccionado && pedidoSeleccionado._id === pedidoId) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, pagado: true });
      }
    } catch (err) {
      message.error('Error al confirmar pago');
      console.error(err);
    }
  }, [pedidoSeleccionado, cargarDatos]);

  // Cancelar pedido
  const cancelarPedido = useCallback(async (pedidoId) => {
    try {
      await pedidosAPI.cancelar(pedidoId);
      message.success('Pedido cancelado exitosamente');
      cargarDatos();
      setModalPedidoVisible(false);
    } catch (err) {
      message.error('Error al cancelar pedido');
      console.error(err);
    }
  }, [cargarDatos]);

  const reproducirSonido = useCallback(() => {
    // Crear un beep simple
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  // eslint-disable-next-line no-unused-vars
  const verDetallesMesa = useCallback((mesaId) => {
    const mesa = mesas.find(m => m._id === mesaId);
    if (mesa) {
      Modal.info({
        title: `Detalles de Mesa ${mesa.numero}`,
        content: (
          <div>
            <p><strong>Estado:</strong> {mesa.estado === 'ocupada' ? 'Ocupada' : 'Disponible'}</p>
            <p><strong>Capacidad:</strong> {mesa.capacidad} personas</p>
            {mesa.estado === 'ocupada' && (
              <p><strong>Total:</strong> {formatearPrecio(mesa.total || 0)}</p>
            )}
          </div>
        ),
        onOk() {},
      });
    }
  }, [mesas]);

  // eslint-disable-next-line no-unused-vars
  const verDetallesPedido = useCallback((pedidoId) => {
    const pedido = pedidos.find(p => p._id === pedidoId);
    if (pedido) {
      Modal.info({
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span>Pedido #{pedido._id.slice(-6).toUpperCase()}</span>
          </div>
        ),
        width: 700,
        content: (
          <div style={{ padding: '16px 0' }}>
            {/* Información Principal */}
            <div style={{
              background: '#f0f9ff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #bae6fd'
            }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#6b7280' }}>Mesa:</Text>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      Mesa {pedido.mesa?.numero || 'N/A'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ color: '#6b7280' }}>Estado:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color={
                        pedido.estado === 'pendiente' ? 'red' :
                        pedido.estado === 'preparando' ? 'orange' :
                        pedido.estado === 'listo' ? 'blue' :
                        pedido.estado === 'entregado' ? 'green' : 'default'
                      } style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {obtenerTextoEstado(pedido.estado)}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: '#6b7280' }}>Fecha:</Text>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {dayjs(pedido.fecha).format('DD/MM/YYYY HH:mm')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    ({dayjs(pedido.fecha).fromNow()})
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong style={{ color: '#6b7280' }}>Cliente:</Text>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {pedido.nombreCliente || 'Cliente'}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Productos */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                📦 Productos ({pedido.productos?.length || 0})
              </h4>
              <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                {pedido.productos?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '6px',
                      marginBottom: idx < pedido.productos.length - 1 ? '8px' : 0,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '24px',
                            height: '24px',
                            background: '#3b82f6',
                            color: '#fff',
                            borderRadius: '50%',
                            textAlign: 'center',
                            lineHeight: '24px',
                            marginRight: '8px',
                            fontSize: '12px'
                          }}>
                            {item.cantidad}
                          </span>
                          {item.producto?.nombre || 'Producto'}
                        </div>
                        {item.notas && (
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px',
                            padding: '6px 8px',
                            background: '#fef3c7',
                            borderRadius: '4px',
                            marginLeft: '32px'
                          }}>
                            💬 <strong>Notas:</strong> {item.notas}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>
                        {formatearPrecio(item.precio * item.cantidad)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div style={{
              background: '#f0fdf4',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text strong>Subtotal:</Text>
                <Text>{formatearPrecio(pedido.total)}</Text>
              </div>
              {pedido.propina > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text strong>Propina:</Text>
                  <Text style={{ color: '#10b981' }}>{formatearPrecio(pedido.propina)}</Text>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '2px solid #86efac'
              }}>
                <Text strong style={{ fontSize: '18px' }}>Total:</Text>
                <Text strong style={{ fontSize: '24px', color: '#10b981' }}>
                  {formatearPrecio(pedido.total + (pedido.propina || 0))}
                </Text>
              </div>
              {pedido.pagado && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <Tag color="success" style={{ fontSize: '14px', padding: '6px 16px' }}>
                    ✅ PAGADO
                  </Tag>
                </div>
              )}
            </div>
          </div>
        ),
        onOk() {},
        okText: 'Cerrar',
        okButtonProps: { size: 'large' }
      });
    }
  }, [pedidos]);

  const confirmarCerrarMesa = useCallback(async (mesaId) => {
    try {
      await mesasAPI.cerrar(mesaId);
      message.success('Mesa cerrada exitosamente');
      await cargarDatos();
    } catch (err) {
      console.error('Error al cerrar mesa:', err);
      message.error('Error al cerrar la mesa');
    }
  }, [cargarDatos]);


  useEffect(() => {
    // Función para manejar nuevos pedidos
    const handleNuevoPedido = (data) => {
      agregarNotificacion(`Nuevo pedido en Mesa ${data.numeroMesa}`);
      cargarDatos();
      reproducirSonido();
    };

    // Función para manejar solicitudes de mesonero
    const handleMesoneroSolicitado = (data) => {
      agregarNotificacion(`Mesa ${data.numeroMesa} solicita atención`);
      reproducirSonido();
    };

    // Función para manejar actualizaciones de mesa
    const handleMesaActualizada = () => cargarDatos();
    
    // Función para manejar actualizaciones de pedidos
    const handlePedidoActualizado = () => cargarDatos();

    // Cargar datos iniciales
    cargarDatos();
    
    // Conectar al socket
    socketService.connect();

    // Configurar listeners de socket
    socketService.onNuevoPedidoAdmin(handleNuevoPedido);
    socketService.onMesoneroSolicitado(handleMesoneroSolicitado);
    socketService.onMesaActualizada(handleMesaActualizada);
    socketService.onPedidoActualizado(handlePedidoActualizado);

    // Listener para abrir pedido desde notificación
    const handleAbrirPedido = (event) => {
      const { pedidoId } = event.detail;
      const pedido = pedidos.find(p => p._id === pedidoId);
      if (pedido) {
        verDetallePedido(pedido);
      }
    };

    window.addEventListener('abrirPedidoDesdeNotificacion', handleAbrirPedido);

    // Limpieza al desmontar
    return () => {
      socketService.off('pedido_nuevo_admin', handleNuevoPedido);
      socketService.off('mesonero_solicitado', handleMesoneroSolicitado);
      socketService.off('mesa_actualizada', handleMesaActualizada);
      socketService.off('pedido_actualizado', handlePedidoActualizado);
      window.removeEventListener('abrirPedidoDesdeNotificacion', handleAbrirPedido);
    };
  }, [agregarNotificacion, cargarDatos, reproducirSonido, pedidos, verDetallePedido]);

  // Configurar atajos de teclado
  useKeyboardShortcuts({
    'ctrl+r': {
      action: () => {
        message.info('⚡ Actualizando datos...');
        cargarDatos();
      },
      allowWhileTyping: true
    },
    'f5': {
      action: () => {
        message.info('⚡ Actualizando datos...');
        cargarDatos();
      },
      allowWhileTyping: true
    },
    '?': {
      action: () => setMostrarAtajos(true)
    },
    'escape': {
      action: () => setMostrarAtajos(false),
      allowWhileTyping: true
    }
  });

  return (
    <AdminLayout>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Panel de Administración</h1>
            <p style={{ color: '#8c8c8c', margin: 0 }}>Sierra Yara Café - Todo en un solo lugar</p>
          </div>
          <Tooltip title="Atajos de teclado (?)">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => setMostrarAtajos(true)}
              size="large"
            >
              Atajos
            </Button>
          </Tooltip>
        </div>

        {/* Sección de Estadísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }} className="fade-in">
          {cargandoInicial ? (
            <>
              <Col xs={24} sm={12} md={6}><StatCardSkeleton /></Col>
              <Col xs={24} sm={12} md={6}><StatCardSkeleton /></Col>
              <Col xs={24} sm={12} md={6}><StatCardSkeleton /></Col>
              <Col xs={24} sm={12} md={6}><StatCardSkeleton /></Col>
            </>
          ) : (
            <>
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable
              style={{
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                height: '100%',
                transition: 'all 0.3s',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  margin: '0 auto 16px',
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                }}>
                  <TableOutlined style={{ fontSize: '28px', color: '#ffffff' }} aria-hidden="true" />
                </div>
                <div style={{ 
                  color: '#8c8c8c', 
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Mesas Ocupadas
                </div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 600,
                  color: '#262626',
                  lineHeight: 1
                }}>
                  {estadisticas.mesasOcupadas}
                  <span style={{ fontSize: '18px', color: '#8c8c8c', fontWeight: 400 }}>
                    /{mesas.length}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable
              style={{
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                height: '100%',
                transition: 'all 0.3s',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  margin: '0 auto 16px',
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(236, 72, 153, 0.3)'
                }}>
                  <ShoppingOutlined style={{ fontSize: '28px', color: '#ffffff' }} aria-hidden="true" />
                </div>
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Pedidos Activos
                </div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 600,
                  color: '#1f2937',
                  lineHeight: 1
                }}>
                  {estadisticas.pedidosActivos}
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable
              style={{
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                height: '100%',
                transition: 'all 0.3s',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  margin: '0 auto 16px',
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                }}>
                  <DollarOutlined style={{ fontSize: '28px', color: '#ffffff' }} aria-hidden="true" />
                </div>
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Ventas del Día
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 600,
                  color: '#1f2937',
                  lineHeight: 1
                }}>
                  {ventasDia ? formatearPrecio(ventasDia.resumen.ventasTotalesConPropinas) : formatearPrecio(estadisticas.totalVentas)}
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card 
              hoverable
              style={{
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                height: '100%',
                transition: 'all 0.3s',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              styles={{ body: { padding: '24px' } }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  margin: '0 auto 16px',
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '28px', color: '#ffffff' }} aria-hidden="true" />
                </div>
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  Tiempo Promedio
                </div>
                <div style={{ 
                  fontSize: '32px', 
                  fontWeight: 600,
                  color: '#1f2937',
                  lineHeight: 1
                }}>
                  25
                  <span style={{ fontSize: '18px', color: '#6b7280', fontWeight: 400 }}>
                    min
                  </span>
                </div>
              </div>
            </Card>
          </Col>
            </>
          )}
        </Row>

        {/* SECCIÓN DE PEDIDOS PENDIENTES URGENTES */}
        {estadisticas.pedidosPendientes > 0 && (
          <Card
            style={{
              marginBottom: '24px',
              borderRadius: '12px',
              border: '2px solid #ef4444',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#991b1b' }}>
                    ⚠️ Pedidos Pendientes
                  </h3>
                  <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px' }}>
                    {estadisticas.pedidosPendientes} pedido{estadisticas.pedidosPendientes > 1 ? 's' : ''} esperando atención
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                danger
                size="large"
                onClick={cargarDatos}
                icon={<ReloadOutlined />}
              >
                Actualizar
              </Button>
            </div>
            
            <Row gutter={[12, 12]}>
              {pedidos
                .filter(p => p.estado === 'pendiente')
                .slice(0, 6)
                .map(pedido => (
                  <Col xs={24} sm={12} md={8} lg={6} key={pedido._id}>
                    <Card
                      hoverable
                      onClick={() => verDetallePedido(pedido)}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #fca5a5',
                        background: '#fff',
                        cursor: 'pointer'
                      }}
                      styles={{ body: { padding: '12px' } }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#ef4444',
                          marginBottom: '4px'
                        }}>
                          Mesa {pedido.mesa?.numero || 'N/A'}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                          {formatearPrecio(pedido.total)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {dayjs(pedido.fecha).fromNow()}
                        </div>
                        <Tag color="red" style={{ marginTop: '8px' }}>
                          {pedido.productos?.length || 0} producto{pedido.productos?.length > 1 ? 's' : ''}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        )}

        {/* Resumen de Ventas del Día */}
        {ventasDia && (
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarOutlined style={{ color: '#10b981' }} />
                <span>Resumen de Ventas del Día</span>
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={cargarDatos}
                size="small"
              >
                Actualizar
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Pedidos</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                    {ventasDia.resumen.totalPedidos}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pedidos Pagados</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                    {ventasDia.resumen.pedidosPagados}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pendientes</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                    {ventasDia.resumen.pedidosPendientes}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#fee2e2', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Cancelados</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
                    {ventasDia.resumen.pedidosCancelados}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
              <Col xs={24} md={12}>
                <Card size="small" title="Ventas Totales" style={{ height: '100%' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Ventas:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{formatearPrecio(ventasDia.resumen.ventasTotales)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#6b7280' }}>Propinas:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#10b981' }}>{formatearPrecio(ventasDia.resumen.propinasTotales)}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>Total con Propinas:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#10b981' }}>{formatearPrecio(ventasDia.resumen.ventasTotalesConPropinas)}</span>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card size="small" title="Ventas por Método de Pago" style={{ height: '100%' }}>
                  {Object.keys(ventasDia.ventasPorMetodo).length > 0 ? (
                    <div>
                      {Object.entries(ventasDia.ventasPorMetodo).map(([metodo, datos]) => (
                        <div key={metodo} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px', background: '#f9fafb', borderRadius: '4px' }}>
                          <span style={{ textTransform: 'capitalize' }}>{metodo.replace('_', ' ')}</span>
                          <div>
                            <span style={{ marginRight: '12px', color: '#6b7280' }}>({datos.cantidad})</span>
                            <span style={{ fontWeight: 'bold' }}>{formatearPrecio(datos.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="No hay ventas registradas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Card>
              </Col>
            </Row>

            {ventasDia.topProductos && ventasDia.topProductos.length > 0 && (
              <Card size="small" title="Top 5 Productos Más Vendidos" style={{ marginTop: '16px' }}>
                {ventasDia.topProductos.map((producto, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: idx === 0 ? '#fbbf24' : idx === 1 ? '#d1d5db' : idx === 2 ? '#cd7f32' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{producto.nombre}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{producto.cantidad} unidades</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{formatearPrecio(producto.total)}</div>
                  </div>
                ))}
              </Card>
            )}
          </Card>
        )}

        <Row gutter={[16, 16]}>
          {/* Columna Izquierda: Estado de Mesas */}
          <Col xs={24} lg={12}>
            <Card 
              title="Estado de Mesas"
              style={{
                borderRadius: '8px',
                height: '100%'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {mesas.map(mesa => (
                  <div 
                    key={mesa._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => verDetalleMesa(mesa)}>
                      <Text strong>Mesa {mesa.numeroMesa}</Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        Total: {formatearPrecio(mesa.totalMesa || 0)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag color={mesa.estado === 'ocupada' ? 'red' : 'green'} style={{ textTransform: 'uppercase', margin: 0 }}>
                        {mesa.estado === 'ocupada' ? 'OCUPADA' : 'LIBRE'}
                      </Tag>
                      {mesa.estado === 'ocupada' && (
                        <Button 
                          type="primary" 
                          size="small"
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: '¿Liberar mesa?',
                              content: `¿Estás seguro de liberar la Mesa ${mesa.numeroMesa}? Esto cerrará todos los pedidos asociados.`,
                              okText: 'Sí, liberar',
                              cancelText: 'Cancelar',
                              onOk: () => confirmarCerrarMesa(mesa._id)
                            });
                          }}
                        >
                          Liberar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Columna Derecha: Pedidos Activos */}
          <Col xs={24} lg={12}>
            <Card 
              title="Pedidos Activos"
              style={{
                borderRadius: '8px',
                height: '100%'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {ultimosPedidos.length > 0 ? (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {ultimosPedidos.map(pedido => (
                    <div 
                      key={pedido._id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => verDetallePedido(pedido)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Text strong>Pedido #{pedido._id.slice(-4).toUpperCase()}</Text>
                        <Text strong>{formatearPrecio(pedido.total)}</Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Mesa {pedido.mesa?.numero || 'N/A'}
                        </Text>
                        <Tag 
                          color={
                            pedido.estado === 'pendiente' ? 'orange' : 
                            pedido.estado === 'en_preparacion' ? 'blue' : 
                            pedido.estado === 'listo' ? 'green' : 'cyan'
                          }
                          style={{ fontSize: '11px' }}
                        >
                          {obtenerTextoEstado(pedido.estado)}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No hay pedidos activos"
                  style={{ padding: '40px 0' }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal de Atajos de Teclado */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined />
            <span>Atajos de Teclado</span>
          </div>
        }
        open={mostrarAtajos}
        onCancel={() => setMostrarAtajos(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setMostrarAtajos(false)}>
            Entendido
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: '16px', color: '#6b7280' }}>
            Usa estos atajos para trabajar más rápido:
          </p>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { keys: ['Ctrl', 'R'], desc: 'Actualizar datos del dashboard' },
              { keys: ['F5'], desc: 'Actualizar datos del dashboard' },
              { keys: ['?'], desc: 'Mostrar esta ayuda' },
              { keys: ['Esc'], desc: 'Cerrar modales y paneles' },
            ].map((atajo, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <span style={{ color: '#1f2937' }}>{atajo.desc}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {atajo.keys.map((key, keyIdx) => (
                    <kbd
                      key={keyIdx}
                      style={{
                        padding: '4px 8px',
                        background: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#374151',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#1e40af' }}>
              💡 <strong>Tip:</strong> Los atajos funcionan en cualquier momento, incluso cuando estás escribiendo.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de Detalle de Mesa */}
      <Modal
        title={`Detalle de Mesa ${mesaSeleccionada?.numero || ''}`}
        open={modalMesaVisible}
        onCancel={() => setModalMesaVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setModalMesaVisible(false)}>
            Cerrar
          </Button>
        ]}
      >
        {mesaSeleccionada && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Tag color={mesaSeleccionada.estado === 'ocupada' ? 'red' : 'green'} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {mesaSeleccionada.estado === 'ocupada' ? 'OCUPADA' : 'LIBRE'}
              </Tag>
              <Text strong style={{ marginLeft: '12px', fontSize: '16px' }}>
                Total: {formatearPrecio(mesaSeleccionada.totalMesa || 0)}
              </Text>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
                Pedidos de esta mesa:
              </Text>
              {pedidos.filter(p => p.mesa?.numero === mesaSeleccionada.numero).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pedidos
                    .filter(p => p.mesa?.numero === mesaSeleccionada.numero)
                    .map(pedido => (
                      <div
                        key={pedido._id}
                        style={{
                          padding: '12px',
                          background: '#fafafa',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <Text strong>Pedido #{pedido._id.slice(-6).toUpperCase()}</Text>
                          <Text strong>{formatearPrecio(pedido.total)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary">Cliente: {pedido.nombreUsuario || 'Anónimo'}</Text>
                          <Tag color={
                            pedido.estado === 'pendiente' ? 'orange' :
                            pedido.estado === 'en_preparacion' ? 'blue' :
                            pedido.estado === 'listo' ? 'green' : 'cyan'
                          }>
                            {obtenerTextoEstado(pedido.estado)}
                          </Tag>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Items: {pedido.items?.length || 0} | 
                            Propina: {formatearPrecio(pedido.propina || 0)} |
                            {pedido.pagado ? ' ✅ Pagado' : ' ⏳ Pendiente'}
                          </Text>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <Empty description="No hay pedidos en esta mesa" />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Detalle de Pedido */}
      <Modal
        title={`Detalle del Pedido #${pedidoSeleccionado?._id.slice(-6).toUpperCase() || ''}`}
        open={modalPedidoVisible}
        onCancel={() => setModalPedidoVisible(false)}
        width={800}
        footer={[
          pedidoSeleccionado && pedidoSeleccionado.estado !== 'cancelado' && pedidoSeleccionado.estado !== 'entregado' && (
            <Popconfirm
              key="cancel"
              title="¿Cancelar pedido?"
              description="¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer."
              onConfirm={() => cancelarPedido(pedidoSeleccionado._id)}
              okText="Sí, cancelar"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger>
                Cancelar Pedido
              </Button>
            </Popconfirm>
          ),
          <Button key="close" onClick={() => setModalPedidoVisible(false)}>
            Cerrar
          </Button>
        ]}
      >
        {pedidoSeleccionado && (
          <div>
            {/* Controles de Estado y Pago */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Estado del Pedido:</Text>
                <Select
                  value={pedidoSeleccionado.estado}
                  onChange={(value) => cambiarEstado(pedidoSeleccionado._id, value)}
                  style={{ width: '100%' }}
                  size="large"
                  disabled={pedidoSeleccionado.estado === 'cancelado' || pedidoSeleccionado.estado === 'entregado'}
                >
                  <Select.Option value="pendiente">
                    <Tag color="orange">Pendiente</Tag>
                  </Select.Option>
                  <Select.Option value="en_preparacion">
                    <Tag color="blue">En Preparación</Tag>
                  </Select.Option>
                  <Select.Option value="listo">
                    <Tag color="green">Listo</Tag>
                  </Select.Option>
                  <Select.Option value="entregado">
                    <Tag color="cyan">Entregado</Tag>
                  </Select.Option>
                </Select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Estado de Pago:</Text>
                {pedidoSeleccionado.pagado ? (
                  <Tag color="green" style={{ fontSize: '14px', padding: '12px 16px', width: '100%', textAlign: 'center', display: 'block' }}>
                    ✅ Pagado
                  </Tag>
                ) : (
                  <Popconfirm
                    title="¿Confirmar pago?"
                    description="¿Confirmas que el pago fue recibido y verificado?"
                    onConfirm={() => confirmarPago(pedidoSeleccionado._id)}
                    okText="Sí, confirmar"
                    cancelText="Cancelar"
                  >
                    <Button type="primary" size="large" style={{ width: '100%' }}>
                      Confirmar Pago
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Información General:</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <Text type="secondary">Mesa:</Text>
                  <Text strong style={{ marginLeft: '8px' }}>
                    {pedidoSeleccionado.mesa?.numero || 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Cliente:</Text>
                  <Text strong style={{ marginLeft: '8px' }}>
                    {pedidoSeleccionado.nombreUsuario || 'Anónimo'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Fecha:</Text>
                  <Text strong style={{ marginLeft: '8px' }}>
                    {dayjs(pedidoSeleccionado.fecha).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Método de Pago:</Text>
                  <Text strong style={{ marginLeft: '8px' }}>
                    {pedidoSeleccionado.metodoPago?.toUpperCase() || 'N/A'}
                  </Text>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>Items del Pedido:</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pedidoSeleccionado.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#fafafa',
                      borderRadius: '6px'
                    }}
                  >
                    <div>
                      <Text strong>{item.nombre}</Text>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                        Cantidad: {item.cantidad}
                      </Text>
                    </div>
                    <Text strong>{formatearPrecio(item.precio * item.cantidad)}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Subtotal:</Text>
                <Text strong>{formatearPrecio((pedidoSeleccionado.total || 0) - (pedidoSeleccionado.propina || 0))}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Propina:</Text>
                <Text strong>{formatearPrecio(pedidoSeleccionado.propina || 0)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                <Text strong style={{ fontSize: '18px', color: '#10b981' }}>
                  {formatearPrecio(pedidoSeleccionado.total || 0)}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default React.memo(Dashboard);
