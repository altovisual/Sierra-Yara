import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { mesasAPI, pedidosAPI } from '../../services/api';
import socketService from '../../services/socket';
import { formatearPrecio, obtenerTextoEstado } from '../../utils/helpers';
import {
  ShoppingOutlined,
  TableOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ReloadOutlined
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
  Modal
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
  const [estadisticas, setEstadisticas] = useState({
    mesasOcupadas: 0,
    pedidosActivos: 0,
    totalVentas: 0,
    pedidosHoy: 0,
    pedidosPendientes: 0
  });
  const [ventasDia, setVentasDia] = useState(null);

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
    }
  }, []);

  const agregarNotificacion = useCallback((mensaje) => {
    message.info(mensaje);
  }, []);

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

  const verDetallesPedido = useCallback((pedidoId) => {
    const pedido = pedidos.find(p => p._id === pedidoId);
    if (pedido) {
      Modal.info({
        title: `Pedido #${pedido._id.slice(-6).toUpperCase()}`,
        width: 600,
        content: (
          <div>
            <p><strong>Mesa:</strong> {pedido.mesa?.numero || 'N/A'}</p>
            <p><strong>Estado:</strong> {obtenerTextoEstado(pedido.estado)}</p>
            <p><strong>Total:</strong> {formatearPrecio(pedido.total)}</p>
            <p><strong>Fecha:</strong> {dayjs(pedido.fecha).format('DD/MM/YYYY HH:mm')}</p>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Productos:</h4>
              <ul className="list-disc pl-5">
                {pedido.productos?.map((item, idx) => (
                  <li key={idx}>
                    {item.cantidad}x {item.producto?.nombre || 'Producto'} - {formatearPrecio(item.precio)}
                    {item.notas && <p className="text-sm text-gray-500 ml-4">Notas: {item.notas}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ),
        onOk() {},
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

    // Limpieza al desmontar
    return () => {
      socketService.off('pedido_nuevo_admin', handleNuevoPedido);
      socketService.off('mesonero_solicitado', handleMesoneroSolicitado);
      socketService.off('mesa_actualizada', handleMesaActualizada);
      socketService.off('pedido_actualizado', handlePedidoActualizado);
    };
  }, [agregarNotificacion, cargarDatos, reproducirSonido]);


  return (
    <AdminLayout>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Panel de Administración</h1>
          <p style={{ color: '#8c8c8c', margin: 0 }}>Sierra Yara Café - Todo en un solo lugar</p>
        </div>

        {/* Sección de Estadísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
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
        </Row>

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
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => verDetallesMesa(mesa._id)}>
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
                      onClick={() => verDetallesPedido(pedido._id)}
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
    </AdminLayout>
  );
};

export default React.memo(Dashboard);
