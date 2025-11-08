import React, { useState, useEffect } from 'react';
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

  return (
    <AdminLayout>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TagOutlined />
            <span>Gestión de Promociones</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => abrirModal()}
          >
            Nueva Promoción
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={promociones}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editando ? 'Editar Promoción' : 'Nueva Promoción'}
        open={modalVisible}
        onCancel={cerrarModal}
        onOk={() => form.submit()}
        width={800}
        okText="Guardar"
        cancelText="Cancelar"
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
                <Input placeholder="Ej: 2x1 en Cafés" />
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
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="tipoDescuento"
                label="Tipo de Descuento"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="porcentaje">Porcentaje (%)</Option>
                  <Option value="monto_fijo">Monto Fijo (Bs)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="descuento"
                label="Descuento"
                rules={[{ required: true, message: 'El descuento es obligatorio' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
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
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="horaInicio"
                label="Hora Inicio"
              >
                <Input type="time" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="horaFin"
                label="Hora Fin"
              >
                <Input type="time" />
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
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="activa"
                label="Activa"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="destacada"
                label="Destacada"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default GestionPromociones;
