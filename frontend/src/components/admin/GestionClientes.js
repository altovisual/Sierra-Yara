import React, { useState, useEffect } from 'react';
import './GestionClientes.css';
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
  ReloadOutlined,
  FilePdfOutlined
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
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Renderizar card de cliente para móvil
  const renderClienteCard = (cliente) => (
    <div key={cliente._id} className="cliente-card" onClick={() => verDetalleCliente(cliente)}>
      <div className="cliente-card-header">
        <div className="cliente-card-title">
          <h3>{cliente.nombre}</h3>
          <Tag 
            icon={getSegmentoIcon(cliente.segmento)} 
            color={getSegmentoColor(cliente.segmento)}
            style={{ marginLeft: '8px' }}
          >
            {cliente.segmento.toUpperCase()}
          </Tag>
        </div>
      </div>

      <div className="cliente-card-info">
        <div className="cliente-info-row">
          <span className="cliente-info-icon"><IdcardOutlined /></span>
          <span className="cliente-info-text">{cliente.cedula}</span>
        </div>
        <div className="cliente-info-row">
          <span className="cliente-info-icon"><PhoneOutlined /></span>
          <span className="cliente-info-text">{cliente.telefono}</span>
        </div>
        {cliente.email && (
          <div className="cliente-info-row">
            <span className="cliente-info-icon"><MailOutlined /></span>
            <span className="cliente-info-text">{cliente.email}</span>
          </div>
        )}
      </div>

      <div className="cliente-card-stats">
        <div className="cliente-stat">
          <ShoppingOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
          <div>
            <div className="cliente-stat-value">{cliente.totalPedidos}</div>
            <div className="cliente-stat-label">Pedidos</div>
          </div>
        </div>
        <div className="cliente-stat">
          <DollarOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <div>
            <div className="cliente-stat-value">${cliente.totalGastado.toFixed(2)}</div>
            <div className="cliente-stat-label">Total</div>
          </div>
        </div>
        <div className="cliente-stat">
          <UserOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
          <div>
            <div className="cliente-stat-value">{cliente.totalVisitas}</div>
            <div className="cliente-stat-label">Visitas</div>
          </div>
        </div>
      </div>

      <div className="cliente-card-footer">
        <div className="cliente-footer-item">
          <span className="cliente-footer-label">Última visita:</span>
          <span className="cliente-footer-value">{dayjs(cliente.ultimaVisita).fromNow()}</span>
        </div>
        {cliente.aceptaMarketing && (
          <Tag color="success" style={{ marginTop: '8px' }}>
            <MailOutlined /> Acepta Marketing
          </Tag>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="clientes-container">
        <div className="clientes-header">
          <div>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
              <UserOutlined /> Gestión de Clientes
            </Title>
            <Text type="secondary">
              Base de datos de clientes para marketing y análisis
            </Text>
          </div>
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
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Buscar por nombre, cédula o teléfono..."
                allowClear
                enterButton={<SearchOutlined />}
                size={isMobile ? 'large' : 'middle'}
                onSearch={buscarClientes}
                onChange={(e) => e.target.value === '' && buscarClientes('')}
                style={{ fontSize: '16px' }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Select
                style={{ width: '100%' }}
                size={isMobile ? 'large' : 'middle'}
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
            <Col xs={24}>
              <Space wrap style={{ width: '100%', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Button
                  icon={<ReloadOutlined />}
                  size={isMobile ? 'large' : 'middle'}
                  onClick={cargarDatos}
                  style={{ minWidth: isMobile ? '120px' : 'auto' }}
                >
                  Actualizar
                </Button>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  size={isMobile ? 'large' : 'middle'}
                  onClick={exportarParaMarketing}
                  style={{ minWidth: isMobile ? '120px' : 'auto' }}
                >
                  Exportar
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  size={isMobile ? 'large' : 'middle'}
                  onClick={async () => {
                    try {
                      await import('../../services/api').then(({ reportesAPI }) => {
                        reportesAPI.descargarReporteClientesPDF();
                      });
                      message.success('Reporte de clientes descargado exitosamente');
                    } catch (error) {
                      message.error('Error al descargar el reporte');
                    }
                  }}
                  style={{ borderColor: '#ff4d4f', color: '#ff4d4f', minWidth: isMobile ? '120px' : 'auto' }}
                  danger
                >
                  PDF
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Tabla/Cards de Clientes */}
        {cargando ? (
          <Card loading={true} />
        ) : isMobile ? (
          /* Vista de Cards para móvil */
          <div className="clientes-grid">
            {clientes.map(renderClienteCard)}
            {clientes.length === 0 && (
              <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <p style={{ color: '#999', margin: 0 }}>No se encontraron clientes</p>
              </Card>
            )}
          </div>
        ) : (
          /* Vista de Tabla para desktop */
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
        )}

        {/* Modal de Detalle del Cliente */}
        <Modal
          title={
            <span style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold' }}>
              <UserOutlined /> Detalle del Cliente
            </span>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={isMobile ? '95%' : 900}
          style={{ maxWidth: '900px', top: isMobile ? 10 : 20 }}
          bodyStyle={{ 
            maxHeight: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)', 
            overflowY: 'auto',
            padding: isMobile ? '16px' : '24px'
          }}
          footer={[
            <Button 
              key="close" 
              onClick={() => setModalVisible(false)}
              size={isMobile ? 'large' : 'middle'}
              block={isMobile}
            >
              Cerrar
            </Button>
          ]}
        >
          {clienteSeleccionado && (
            <div>
              {/* Información del Cliente */}
              <Descriptions 
                bordered 
                column={{ xs: 1, sm: 2 }} 
                size="small"
                labelStyle={{ fontWeight: '600', backgroundColor: '#fafafa' }}
                contentStyle={{ backgroundColor: '#ffffff' }}
              >
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
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Visitas"
                    value={clienteSeleccionado.totalVisitas}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Pedidos"
                    value={clienteSeleccionado.totalPedidos}
                    prefix={<ShoppingOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Gastado"
                    value={clienteSeleccionado.totalGastado.toFixed(2)}
                    prefix="$"
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Promedio Gasto"
                    value={clienteSeleccionado.promedioGasto.toFixed(2)}
                    prefix="$"
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col xs={24} sm={12}>
                  <Card size="small" title="Primera Visita">
                    {dayjs(clienteSeleccionado.primeraVisita).format('DD/MM/YYYY HH:mm')}
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
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
