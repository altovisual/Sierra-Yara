import React, { useState, useEffect } from 'react';
import './GestionPromociones.css';
import { 
  Card, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Select, 
  DatePicker,
  Switch,
  message,
  Tag,
  Space,
  Popconfirm,
  Row,
  Col,
  Checkbox
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { promocionesAPI, productosAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import dayjs from 'dayjs';
import { formatearPrecio } from '../../utils/helpers';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const GestionPromociones = () => {
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const diasSemana = [
    { label: 'Lunes', value: 'lunes' },
    { label: 'Martes', value: 'martes' },
    { label: 'Miércoles', value: 'miercoles' },
    { label: 'Jueves', value: 'jueves' },
    { label: 'Viernes', value: 'viernes' },
    { label: 'Sábado', value: 'sabado' },
    { label: 'Domingo', value: 'domingo' }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [promocionesRes, productosRes] = await Promise.all([
        promocionesAPI.obtenerTodas(),
        productosAPI.obtenerTodos()
      ]);
      setPromociones(promocionesRes.data.data || []);
      setProductos(productosRes.data.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (promocion = null) => {
    setEditando(promocion);
    if (promocion) {
      form.setFieldsValue({
        ...promocion,
        fechas: [dayjs(promocion.fechaInicio), dayjs(promocion.fechaFin)],
        productos: promocion.productos?.map(p => p._id || p)
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        tipoDescuento: 'porcentaje',
        activa: true,
        destacada: false,
        horaInicio: '00:00',
        horaFin: '23:59'
      });
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditando(null);
    form.resetFields();
  };

  const guardarPromocion = async (values) => {
    try {
      // Preparar los datos
      const data = {
        titulo: values.titulo,
        descripcion: values.descripcion,
        descuento: values.descuento || 0,
        tipoDescuento: values.tipoDescuento || 'porcentaje',
        fechaInicio: values.fechas[0].toISOString(),
        fechaFin: values.fechas[1].toISOString(),
        activa: values.activa !== undefined ? values.activa : true,
        destacada: values.destacada !== undefined ? values.destacada : false,
        horaInicio: values.horaInicio || '00:00',
        horaFin: values.horaFin || '23:59'
      };

      // Agregar campos opcionales solo si tienen valor
      if (values.productos && values.productos.length > 0) {
        data.productos = values.productos;
      }
      
      if (values.categorias && values.categorias.length > 0) {
        data.categorias = values.categorias;
      }
      
      if (values.diasSemana && values.diasSemana.length > 0) {
        data.diasSemana = values.diasSemana;
      }
      
      if (values.condiciones) {
        data.condiciones = values.condiciones;
      }

      console.log('Datos a enviar:', data);

      if (editando) {
        await promocionesAPI.actualizar(editando._id, data);
        message.success('Promoción actualizada exitosamente');
      } else {
        await promocionesAPI.crear(data);
        message.success('Promoción creada exitosamente');
      }
      
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar promoción:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      // Mostrar errores de validación si existen
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => message.error(err));
      } else {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al guardar la promoción';
        message.error(errorMsg);
      }
    }
  };

  const eliminarPromocion = async (id) => {
    try {
      await promocionesAPI.eliminar(id);
      message.success('Promoción eliminada exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      message.error('Error al eliminar la promoción');
    }
  };

  const toggleActiva = async (id) => {
    try {
      await promocionesAPI.toggleActiva(id);
      message.success('Estado actualizado');
      cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      message.error('Error al cambiar el estado');
    }
  };

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.destacada && (
            <Tag color="gold" style={{ marginTop: 4 }}>
              <TagOutlined /> Destacada
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Descuento',
      dataIndex: 'descuento',
      key: 'descuento',
      render: (descuento, record) => (
        <Tag color="green">
          {record.tipoDescuento === 'porcentaje' 
            ? `${descuento}%` 
            : formatearPrecio(descuento)}
        </Tag>
      ),
    },
    {
      title: 'Vigencia',
      key: 'vigencia',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {dayjs(record.fechaInicio).format('DD/MM/YYYY')} - {dayjs(record.fechaFin).format('DD/MM/YYYY')}
          </div>
          {record.diasSemana && record.diasSemana.length > 0 && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
              {record.diasSemana.map(d => d.charAt(0).toUpperCase()).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activa',
      key: 'activa',
      render: (activa, record) => {
        const ahora = new Date();
        const vigente = activa && 
          new Date(record.fechaInicio) <= ahora && 
          new Date(record.fechaFin) >= ahora;
        
        return (
          <Tag 
            icon={vigente ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={vigente ? 'success' : 'default'}
          >
            {vigente ? 'Activa' : 'Inactiva'}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => abrirModal(record)}
            size="small"
          />
          <Switch
            checked={record.activa}
            onChange={() => toggleActiva(record._id)}
            size="small"
          />
          <Popconfirm
            title="¿Eliminar promoción?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => eliminarPromocion(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Renderizar card de promoción para móvil
  const renderPromocionCard = (promocion) => {
    const ahora = new Date();
    const vigente = promocion.activa && 
      new Date(promocion.fechaInicio) <= ahora && 
      new Date(promocion.fechaFin) >= ahora;

    return (
      <div key={promocion._id} className="promo-card">
        <div className="promo-card-header">
          <div className="promo-card-title">
            <h3>{promocion.titulo}</h3>
            {promocion.destacada && (
              <Tag color="gold" style={{ marginLeft: '8px' }}>
                <TagOutlined /> Destacada
              </Tag>
            )}
          </div>
          <Tag 
            color={vigente ? 'success' : 'default'}
            icon={vigente ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {vigente ? 'Activa' : 'Inactiva'}
          </Tag>
        </div>

        <p className="promo-card-description">{promocion.descripcion}</p>

        <div className="promo-card-info">
          <div className="promo-info-item">
            <span className="promo-info-label">Descuento:</span>
            <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
              {promocion.tipoDescuento === 'porcentaje' 
                ? `${promocion.descuento}%` 
                : formatearPrecio(promocion.descuento)}
            </Tag>
          </div>
          <div className="promo-info-item">
            <span className="promo-info-label">Vigencia:</span>
            <span className="promo-info-value">
              {dayjs(promocion.fechaInicio).format('DD/MM/YY')} - {dayjs(promocion.fechaFin).format('DD/MM/YY')}
            </span>
          </div>
          {promocion.diasSemana && promocion.diasSemana.length > 0 && (
            <div className="promo-info-item">
              <span className="promo-info-label">Días:</span>
              <span className="promo-info-value">
                {promocion.diasSemana.map(d => d.charAt(0).toUpperCase()).join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="promo-card-actions">
          <Switch
            checked={promocion.activa}
            onChange={() => toggleActiva(promocion._id)}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
          <div className="promo-action-buttons">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => abrirModal(promocion)}
              style={{ minHeight: '40px' }}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Eliminar promoción?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => eliminarPromocion(promocion._id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                style={{ minHeight: '40px' }}
              >
                Eliminar
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="promociones-container">
        {/* Header */}
        <div className="promociones-header">
          <div className="promociones-title">
            <TagOutlined style={{ fontSize: isMobile ? '20px' : '24px' }} />
            <div>
              <h2>Gestión de Promociones</h2>
              <p>{promociones.length} promociones en total</p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => abrirModal()}
            size={isMobile ? 'large' : 'middle'}
            block={isMobile}
          >
            Nueva Promoción
          </Button>
        </div>

        {/* Contenido */}
        {loading ? (
          <Card loading={true} />
        ) : isMobile ? (
          /* Vista de Cards para móvil */
          <div className="promociones-grid">
            {promociones.map(renderPromocionCard)}
            {promociones.length === 0 && (
              <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
                <TagOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <p style={{ color: '#999', margin: 0 }}>No hay promociones</p>
              </Card>
            )}
          </div>
        ) : (
          /* Vista de Tabla para desktop */
          <Card>
            <Table
              columns={columns}
              dataSource={promociones}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>
        )}
      </div>

      <Modal
        title={
          <span style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold' }}>
            {editando ? 'Editar Promoción' : 'Nueva Promoción'}
          </span>
        }
        open={modalVisible}
        onCancel={cerrarModal}
        onOk={() => form.submit()}
        width={isMobile ? '95%' : 800}
        style={{ maxWidth: '800px', top: isMobile ? 10 : 20 }}
        bodyStyle={{ 
          maxHeight: isMobile ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)', 
          overflowY: 'auto',
          padding: isMobile ? '16px' : '24px'
        }}
        okText="Guardar"
        cancelText="Cancelar"
        okButtonProps={{ style: { minHeight: isMobile ? '44px' : '32px' } }}
        cancelButtonProps={{ style: { minHeight: isMobile ? '44px' : '32px' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={guardarPromocion}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="titulo"
                label="Título"
                rules={[{ required: true, message: 'El título es obligatorio' }]}
              >
                <Input 
                  placeholder="Ej: 2x1 en Cafés" 
                  style={{ fontSize: '16px', minHeight: isMobile ? '44px' : 'auto' }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="descripcion"
                label="Descripción"
                rules={[{ required: true, message: 'La descripción es obligatoria' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Describe la promoción en detalle"
                  style={{ fontSize: '16px' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="tipoDescuento"
                label="Tipo de Descuento"
                rules={[{ required: true }]}
              >
                <Select style={{ fontSize: '16px' }}>
                  <Option value="porcentaje">Porcentaje (%)</Option>
                  <Option value="monto_fijo">Monto Fijo (Bs)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="descuento"
                label="Descuento"
                rules={[{ required: true, message: 'El descuento es obligatorio' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%', fontSize: '16px', minHeight: isMobile ? '44px' : 'auto' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="fechas"
                label="Período de Vigencia"
                rules={[{ required: true, message: 'Las fechas son obligatorias' }]}
              >
                <RangePicker 
                  style={{ width: '100%', fontSize: '16px' }}
                  format="DD/MM/YYYY"
                  size={isMobile ? 'large' : 'middle'}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="horaInicio"
                label="Hora Inicio"
              >
                <Input 
                  type="time" 
                  style={{ fontSize: '16px', minHeight: isMobile ? '44px' : 'auto' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="horaFin"
                label="Hora Fin"
              >
                <Input 
                  type="time" 
                  style={{ fontSize: '16px', minHeight: isMobile ? '44px' : 'auto' }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="diasSemana"
                label="Días de la Semana (opcional)"
              >
                <Checkbox.Group options={diasSemana} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="productos"
                label="Productos Aplicables (opcional)"
              >
                <Select
                  mode="multiple"
                  placeholder="Selecciona productos"
                  optionFilterProp="children"
                  style={{ fontSize: '16px' }}
                  size={isMobile ? 'large' : 'middle'}
                >
                  {productos.map(producto => (
                    <Option key={producto._id} value={producto._id}>
                      {producto.nombre} - {producto.categoria}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="condiciones"
                label="Condiciones (opcional)"
              >
                <TextArea 
                  rows={2} 
                  placeholder="Ej: Válido solo para consumo en local"
                  style={{ fontSize: '16px' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="activa"
                label="Activa"
                valuePropName="checked"
              >
                <Switch size={isMobile ? 'default' : 'small'} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="destacada"
                label="Destacada"
                valuePropName="checked"
              >
                <Switch size={isMobile ? 'default' : 'small'} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default GestionPromociones;
