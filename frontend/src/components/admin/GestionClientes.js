import React, { useState, useEffect } from 'react';
import { clientesAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Descriptions,
  Card,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
  Tooltip,
  List,
  Typography,
  Divider,
  Badge
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  MailOutlined,
  ShoppingOutlined,
  DollarOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  StarOutlined,
  CrownOutlined,
  TrophyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Componente para gestionar clientes y marketing
 */
const GestionClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [filtroSegmento, setFiltroSegmento] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidosCliente, setPedidosCliente] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [clientesRes, estadisticasRes] = await Promise.all([
        clientesAPI.obtenerTodos({ segmento: filtroSegmento, busqueda }),
        clientesAPI.obtenerEstadisticas()
      ]);
      
      setClientes(clientesRes.data.data);
      setEstadisticas(estadisticasRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos de clientes');
    } finally {
      setCargando(false);
    }
  };

  const buscarClientes = async (valor) => {
    setBusqueda(valor);
    try {
      const response = await clientesAPI.obtenerTodos({ 
        segmento: filtroSegmento, 
        busqueda: valor 
      });
      setClientes(response.data.data);
    } catch (error) {
      message.error('Error al buscar clientes');
    }
  };

  const filtrarPorSegmento = async (segmento) => {
    setFiltroSegmento(segmento);
    try {
      const response = await clientesAPI.obtenerTodos({ 
        segmento, 
        busqueda 
      });
      setClientes(response.data.data);
    } catch (error) {
      message.error('Error al filtrar clientes');
    }
  };

  const verDetalleCliente = async (cliente) => {
    try {
      const response = await clientesAPI.obtenerPorId(cliente._id);
      setClienteSeleccionado(response.data.data.cliente);
      setPedidosCliente(response.data.data.pedidos);
      setModalVisible(true);
    } catch (error) {
      message.error('Error al cargar detalles del cliente');
    }
  };

  const exportarParaMarketing = async () => {
    try {
      const response = await clientesAPI.exportarMarketing({ 
        segmento: filtroSegmento 
      });
      
      // Convertir a CSV
      const clientes = response.data.data;
      const headers = ['Nombre', 'Cédula', 'Teléfono', 'Email', 'Segmento', 'Total Gastado', 'Total Pedidos', 'Última Visita'];
      const csv = [
        headers.join(','),
        ...clientes.map(c => [
          c.nombre,
          c.cedula,
          c.telefono,
          c.email || 'N/A',
          c.segmento,
          c.totalGastado.toFixed(2),
          c.totalPedidos,
          dayjs(c.ultimaVisita).format('DD/MM/YYYY')
        ].join(','))
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clientes_marketing_${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();
      
      message.success(`${clientes.length} clientes exportados exitosamente`);
    } catch (error) {
      message.error('Error al exportar clientes');
    }
  };

  const getSegmentoColor = (segmento) => {
    const colores = {
      nuevo: 'blue',
      regular: 'green',
      frecuente: 'orange',
      vip: 'gold',
      inactivo: 'default'
    };
    return colores[segmento] || 'default';
  };

  const getSegmentoIcon = (segmento) => {
    const iconos = {
      nuevo: <UserOutlined />,
      regular: <StarOutlined />,
      frecuente: <TrophyOutlined />,
      vip: <CrownOutlined />,
      inactivo: <UserOutlined />
    };
    return iconos[segmento] || <UserOutlined />;
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 200,
      render: (nombre, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{nombre}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <IdcardOutlined /> {record.cedula}
          </div>
        </div>
      )
    },
    {
      title: 'Contacto',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 150,
      render: (telefono, record) => (
        <div>
          <div><PhoneOutlined /> {telefono}</div>
          {record.email && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined /> {record.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Segmento',
      dataIndex: 'segmento',
      key: 'segmento',
      width: 120,
      render: (segmento) => (
        <Tag icon={getSegmentoIcon(segmento)} color={getSegmentoColor(segmento)}>
          {segmento.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Estadísticas',
      key: 'estadisticas',
      width: 150,
      render: (_, record) => (
        <div>
          <div><ShoppingOutlined /> {record.totalPedidos} pedidos</div>
          <div><DollarOutlined /> ${record.totalGastado.toFixed(2)}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Promedio: ${record.promedioGasto.toFixed(2)}
          </div>
        </div>
      )
    },
    {
      title: 'Visitas',
      dataIndex: 'totalVisitas',
      key: 'totalVisitas',
      width: 80,
      align: 'center',
      render: (visitas) => <Badge count={visitas} showZero color="blue" />
    },
    {
      title: 'Última Visita',
      dataIndex: 'ultimaVisita',
      key: 'ultimaVisita',
      width: 120,
      render: (fecha) => (
        <Tooltip title={dayjs(fecha).format('DD/MM/YYYY HH:mm')}>
          {dayjs(fecha).fromNow()}
        </Tooltip>
      )
    },
    {
      title: 'Marketing',
      dataIndex: 'aceptaMarketing',
      key: 'marketing',
      width: 100,
      align: 'center',
      render: (acepta) => acepta ? (
        <Tag color="success">✓ Acepta</Tag>
      ) : (
        <Tag color="default">✗ No</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => verDetalleCliente(record)}
        >
          Ver
        </Button>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <UserOutlined /> Gestión de Clientes
          </Title>
          <Text type="secondary">
            Base de datos de clientes para marketing y análisis
          </Text>
        </div>

        {/* Estadísticas Generales */}
        {estadisticas && (
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Clientes"
                  value={estadisticas.totalClientes}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Clientes VIP"
                  value={estadisticas.clientesVIP}
                  prefix={<CrownOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Clientes Frecuentes"
                  value={estadisticas.clientesFrecuentes}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Aceptan Marketing"
                  value={estadisticas.aceptanMarketing}
                  prefix={<MailOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filtros y Búsqueda */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Buscar por nombre, cédula o teléfono..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={buscarClientes}
                onChange={(e) => e.target.value === '' && buscarClientes('')}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                style={{ width: '100%' }}
                size="large"
                value={filtroSegmento}
                onChange={filtrarPorSegmento}
              >
                <Option value="todos">Todos los segmentos</Option>
                <Option value="nuevo">🆕 Nuevos</Option>
                <Option value="regular">👤 Regulares</Option>
                <Option value="frecuente">⭐ Frecuentes</Option>
                <Option value="vip">💎 VIP</Option>
                <Option value="inactivo">😴 Inactivos</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  size="large"
                  onClick={cargarDatos}
                >
                  Actualizar
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                  onClick={exportarParaMarketing}
                >
                  Exportar
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Tabla de Clientes */}
        <Card>
          <Table
            columns={columns}
            dataSource={clientes}
            rowKey="_id"
            loading={cargando}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} clientes`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Modal de Detalle del Cliente */}
        <Modal
          title={
            <div>
              <UserOutlined /> Detalle del Cliente
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={900}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Cerrar
            </Button>
          ]}
        >
          {clienteSeleccionado && (
            <div>
              {/* Información del Cliente */}
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Nombre" span={2}>
                  <strong>{clienteSeleccionado.nombre}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Cédula">
                  {clienteSeleccionado.cedula}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {clienteSeleccionado.telefono}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={2}>
                  {clienteSeleccionado.email || 'No registrado'}
                </Descriptions.Item>
                <Descriptions.Item label="Segmento">
                  <Tag icon={getSegmentoIcon(clienteSeleccionado.segmento)} 
                       color={getSegmentoColor(clienteSeleccionado.segmento)}>
                    {clienteSeleccionado.segmento.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Acepta Marketing">
                  {clienteSeleccionado.aceptaMarketing ? (
                    <Tag color="success">✓ Sí</Tag>
                  ) : (
                    <Tag color="default">✗ No</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* Estadísticas */}
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={6}>
                  <Statistic
                    title="Total Visitas"
                    value={clienteSeleccionado.totalVisitas}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Pedidos"
                    value={clienteSeleccionado.totalPedidos}
                    prefix={<ShoppingOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Total Gastado"
                    value={clienteSeleccionado.totalGastado.toFixed(2)}
                    prefix="$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Promedio Gasto"
                    value={clienteSeleccionado.promedioGasto.toFixed(2)}
                    prefix="$"
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={12}>
                  <Card size="small" title="Primera Visita">
                    {dayjs(clienteSeleccionado.primeraVisita).format('DD/MM/YYYY HH:mm')}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Última Visita">
                    {dayjs(clienteSeleccionado.ultimaVisita).format('DD/MM/YYYY HH:mm')}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      ({dayjs(clienteSeleccionado.ultimaVisita).fromNow()})
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Productos Preferidos */}
              {clienteSeleccionado.productosPreferidos && clienteSeleccionado.productosPreferidos.length > 0 && (
                <Card size="small" title="Productos Preferidos" style={{ marginBottom: '16px' }}>
                  <List
                    size="small"
                    dataSource={clienteSeleccionado.productosPreferidos}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.nombreProducto}
                          description={`Ordenado ${item.vecesOrdenado} veces`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}

              {/* Historial de Pedidos */}
              <Card size="small" title={`Historial de Pedidos (${pedidosCliente.length})`}>
                <List
                  size="small"
                  dataSource={pedidosCliente}
                  renderItem={(pedido) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div>
                            Mesa {pedido.mesaId?.numeroMesa} - ${pedido.total.toFixed(2)}
                            <Tag color={pedido.estadoPago === 'confirmado' ? 'success' : 'default'} style={{ marginLeft: '8px' }}>
                              {pedido.estadoPago}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <div>{pedido.items.length} items - {dayjs(pedido.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                            <div style={{ fontSize: '11px' }}>
                              {pedido.items.map(item => `${item.cantidad}x ${item.nombreProducto}`).join(', ')}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* Notas */}
              {clienteSeleccionado.notas && (
                <Card size="small" title="Notas" style={{ marginTop: '16px' }}>
                  {clienteSeleccionado.notas}
                </Card>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default GestionClientes;
