import React, { useState, useEffect } from 'react';
import { pedidosAPI } from '../../services/api';
import socketService from '../../services/socket';
import { formatearPrecio, obtenerTextoEstado } from '../../utils/helpers';
import { TableSkeleton } from '../common/SkeletonLoaders';
import AdminLayout from './AdminLayout';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Descriptions, 
  Card, 
  Select, 
  message,
  Tooltip,
  Image
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DollarOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

/**
 * Componente para gestionar pedidos (CRUD)
 */
const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPago, setFiltroPago] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarPedidos();
    
    // Escuchar actualizaciones en tiempo real
    socketService.onPedidoActualizado(() => {
      cargarPedidos();
    });

    return () => {
      socketService.off('pedido_actualizado');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const response = await pedidosAPI.obtenerTodos();
      // Ordenar por fecha de creación (más recientes primero)
      const pedidosOrdenados = (response.data.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      message.error('Error al cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await pedidosAPI.actualizarEstado(pedidoId, nuevoEstado);
      message.success(`Pedido actualizado a: ${obtenerTextoEstado(nuevoEstado)}`);
      cargarPedidos();
    } catch (err) {
      message.error('Error al actualizar estado del pedido');
      console.error(err);
    }
  };

  const cancelarPedido = async (pedidoId) => {
    Modal.confirm({
      title: '¿Cancelar pedido?',
      content: '¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.',
      okText: 'Sí, cancelar',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await pedidosAPI.cancelar(pedidoId);
          message.success('Pedido cancelado exitosamente');
          cargarPedidos();
        } catch (err) {
          message.error('Error al cancelar pedido');
          console.error(err);
        }
      }
    });
  };

  const confirmarPago = async (pedidoId) => {
    Modal.confirm({
      title: '¿Confirmar pago?',
      content: '¿Confirmas que el pago fue recibido y verificado?',
      okText: 'Sí, confirmar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await pedidosAPI.confirmarPago(pedidoId);
          message.success('Pago confirmado exitosamente');
          cargarPedidos();
          if (modalVisible) setModalVisible(false);
        } catch (err) {
          message.error('Error al confirmar pago');
          console.error(err);
        }
      }
    });
  };

  const verDetalle = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
  };

  const pedidosFiltrados = pedidos.filter(p => {
    let cumpleFiltroEstado = true;
    let cumpleFiltroPago = true;

    // Filtro de estado
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'activos') {
        cumpleFiltroEstado = !['entregado', 'cancelado'].includes(p.estado);
      } else {
        cumpleFiltroEstado = p.estado === filtroEstado;
      }
    }

    // Filtro de pago
    if (filtroPago !== 'todos') {
      if (filtroPago === 'pagado') {
        cumpleFiltroPago = p.pagado === true;
      } else if (filtroPago === 'pendiente') {
        cumpleFiltroPago = p.estadoPago === 'pendiente';
      } else if (filtroPago === 'procesando') {
        cumpleFiltroPago = p.estadoPago === 'procesando';
      }
    }

    return cumpleFiltroEstado && cumpleFiltroPago;
  });

  const getEstadoColor = (estado) => {
    const colores = {
      recibido: 'blue',
      en_preparacion: 'orange',
      listo: 'purple',
      entregado: 'green',
      cancelado: 'red'
    };
    return colores[estado] || 'default';
  };

  const getPagoColor = (estadoPago, pagado) => {
    if (pagado) return 'green';
    if (estadoPago === 'procesando') return 'orange';
    if (estadoPago === 'rechazado') return 'red';
    return 'default';
  };

  const getPagoTexto = (estadoPago, pagado) => {
    if (pagado) return 'Pagado';
    if (estadoPago === 'procesando') return 'Procesando';
    if (estadoPago === 'rechazado') return 'Rechazado';
    return 'Pendiente';
  };


  // Columnas de la tabla
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 100,
      render: (id) => `#${id.slice(-6)}`
    },
    {
      title: 'Mesa',
      dataIndex: ['mesaId', 'numeroMesa'],
      key: 'mesa',
      width: 80,
      render: (numeroMesa) => numeroMesa || 'N/A'
    },
    {
      title: 'Cliente',
      dataIndex: 'nombreUsuario',
      key: 'cliente',
      width: 120,
      render: (nombre) => nombre || 'Anónimo'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      render: (total) => formatearPrecio(total)
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 130,
      render: (estado) => (
        <Tag color={getEstadoColor(estado)}>
          {obtenerTextoEstado(estado)}
        </Tag>
      )
    },
    {
      title: 'Pago',
      key: 'pago',
      width: 120,
      render: (_, record) => (
        <Tag color={getPagoColor(record.estadoPago, record.pagado)}>
          {getPagoTexto(record.estadoPago, record.pagado)}
        </Tag>
      )
    },
    {
      title: 'Método',
      dataIndex: 'metodoPago',
      key: 'metodoPago',
      width: 120,
      render: (metodo) => metodo ? metodo.replace('_', ' ').toUpperCase() : 'N/A'
    },
    {
      title: 'Hora',
      dataIndex: 'createdAt',
      key: 'hora',
      width: 100,
      render: (fecha) => dayjs(fecha).format('HH:mm')
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => verDetalle(record)}
            />
          </Tooltip>
          {!record.pagado && record.estadoPago === 'procesando' && (
            <Tooltip title="Confirmar pago">
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => confirmarPago(record._id)}
              />
            </Tooltip>
          )}
          {record.estado !== 'cancelado' && record.estado !== 'entregado' && (
            <Tooltip title="Cancelar">
              <Button 
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => cancelarPedido(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Gestión de Pedidos</h2>
            <p style={{ color: '#666', margin: '4px 0 0 0' }}>
              {pedidosFiltrados.length} de {pedidos.length} pedidos
            </p>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={cargarPedidos}
          >
            Actualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card style={{ marginBottom: '24px' }}>
          <Space size="middle" wrap>
            <div>
              <span style={{ marginRight: '8px', fontWeight: '500' }}>Estado:</span>
              <Select 
                value={filtroEstado} 
                onChange={setFiltroEstado}
                style={{ width: 180 }}
              >
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="activos">Activos</Select.Option>
                <Select.Option value="recibido">Recibidos</Select.Option>
                <Select.Option value="en_preparacion">En Preparación</Select.Option>
                <Select.Option value="listo">Listos</Select.Option>
                <Select.Option value="entregado">Entregados</Select.Option>
                <Select.Option value="cancelado">Cancelados</Select.Option>
              </Select>
            </div>
            <div>
              <span style={{ marginRight: '8px', fontWeight: '500' }}>Pago:</span>
              <Select 
                value={filtroPago} 
                onChange={setFiltroPago}
                style={{ width: 150 }}
              >
                <Select.Option value="todos">Todos</Select.Option>
                <Select.Option value="pendiente">Pendiente</Select.Option>
                <Select.Option value="procesando">Procesando</Select.Option>
                <Select.Option value="pagado">Pagado</Select.Option>
              </Select>
            </div>
          </Space>
        </Card>

        {/* Tabla de pedidos */}
        {cargando ? (
          <TableSkeleton rows={8} />
        ) : (
          <Table 
            columns={columns}
            dataSource={pedidosFiltrados}
            rowKey="_id"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} pedidos`
            }}
            className="fade-in"
          />
        )}

        {/* Modal de detalle */}
        <Modal
          title="Detalle del Pedido"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={700}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Cerrar
            </Button>,
            pedidoSeleccionado && !pedidoSeleccionado.pagado && pedidoSeleccionado.estadoPago === 'procesando' && (
              <Button 
                key="confirm" 
                type="primary"
                icon={<DollarOutlined />}
                onClick={() => confirmarPago(pedidoSeleccionado._id)}
              >
                Confirmar Pago
              </Button>
            )
          ]}
        >
          {pedidoSeleccionado && (
            <div>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="ID">
                  {pedidoSeleccionado._id}
                </Descriptions.Item>
                <Descriptions.Item label="Mesa">
                  {pedidoSeleccionado.mesaId?.numeroMesa || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Cliente">
                  {pedidoSeleccionado.nombreUsuario || 'Anónimo'}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha">
                  {dayjs(pedidoSeleccionado.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag color={getEstadoColor(pedidoSeleccionado.estado)}>
                    {obtenerTextoEstado(pedidoSeleccionado.estado)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Pago">
                  <Tag color={getPagoColor(pedidoSeleccionado.estadoPago, pedidoSeleccionado.pagado)}>
                    {getPagoTexto(pedidoSeleccionado.estadoPago, pedidoSeleccionado.pagado)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Método de Pago">
                  {pedidoSeleccionado.metodoPago ? pedidoSeleccionado.metodoPago.replace('_', ' ').toUpperCase() : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Referencia">
                  {pedidoSeleccionado.referenciaPago || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Propina">
                  {formatearPrecio(pedidoSeleccionado.propina || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <strong>{formatearPrecio(pedidoSeleccionado.total)}</strong>
                </Descriptions.Item>
              </Descriptions>

              {pedidoSeleccionado.notas && (
                <Card size="small" title="Notas" style={{ marginTop: '16px' }}>
                  {pedidoSeleccionado.notas}
                </Card>
              )}

              <Card size="small" title="Items del Pedido" style={{ marginTop: '16px' }}>
                {pedidoSeleccionado.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < pedidoSeleccionado.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <span>
                      <strong>{item.cantidad}x</strong> {item.nombreProducto}
                    </span>
                    <span>{formatearPrecio(item.subtotal)}</span>
                  </div>
                ))}
              </Card>

              {pedidoSeleccionado.comprobantePago && (
                <Card size="small" title="Comprobante de Pago" style={{ marginTop: '16px' }}>
                  <Image 
                    src={pedidoSeleccionado.comprobantePago}
                    alt="Comprobante"
                    style={{ maxWidth: '100%' }}
                  />
                </Card>
              )}

              {pedidoSeleccionado.estado !== 'cancelado' && pedidoSeleccionado.estado !== 'entregado' && (
                <Card size="small" title="Cambiar Estado" style={{ marginTop: '16px' }}>
                  <Space wrap>
                    {pedidoSeleccionado.estado === 'recibido' && (
                      <Button onClick={() => { cambiarEstado(pedidoSeleccionado._id, 'en_preparacion'); setModalVisible(false); }}>
                        Iniciar Preparación
                      </Button>
                    )}
                    {pedidoSeleccionado.estado === 'en_preparacion' && (
                      <Button type="primary" onClick={() => { cambiarEstado(pedidoSeleccionado._id, 'listo'); setModalVisible(false); }}>
                        Marcar como Listo
                      </Button>
                    )}
                    {pedidoSeleccionado.estado === 'listo' && (
                      <Button onClick={() => { cambiarEstado(pedidoSeleccionado._id, 'entregado'); setModalVisible(false); }}>
                        Marcar como Entregado
                      </Button>
                    )}
                  </Space>
                </Card>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default GestionPedidos;
