import React, { useState, useEffect } from 'react';
import { Card, Table, Button, InputNumber, Tag, message, Modal, Form, Select, Space } from 'antd';
import { StatCardSkeleton } from '../common/SkeletonLoaders';
import { 
  InboxOutlined, 
  PlusOutlined, 
  EditOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import AdminLayout from './AdminLayout';
import { productosAPI } from '../../services/api';

const { Option } = Select;

/**
 * Componente para gestionar el inventario de productos
 */
const GestionInventario = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await productosAPI.obtenerTodos();
      setProductos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      message.error('Error al cargar el inventario');
    } finally {
      setCargando(false);
    }
  };


  const toggleDisponibilidad = async (producto) => {
    try {
      await productosAPI.actualizar(producto._id, {
        disponible: !producto.disponible
      });
      message.success(`Producto ${producto.disponible ? 'desactivado' : 'activado'}`);
      cargarProductos();
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      message.error('Error al cambiar disponibilidad');
    }
  };

  const abrirModalInventario = (producto) => {
    setProductoEditando(producto);
    form.setFieldsValue({
      stock: producto.stock || 0,
      stockMinimo: producto.stockMinimo || 5,
      unidadMedida: producto.unidadMedida || 'unidades'
    });
    setModalVisible(true);
  };

  const guardarInventario = async (values) => {
    try {
      await productosAPI.actualizar(productoEditando._id, {
        stock: values.stock,
        stockMinimo: values.stockMinimo,
        unidadMedida: values.unidadMedida,
        disponible: values.stock > 0
      });
      message.success('Inventario actualizado');
      setModalVisible(false);
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar inventario:', error);
      message.error('Error al guardar el inventario');
    }
  };

  const obtenerEstadoStock = (producto) => {
    const stock = producto.stock || 0;
    const stockMinimo = producto.stockMinimo || 5;

    if (stock === 0) {
      return { color: 'red', text: 'Agotado', icon: <CloseCircleOutlined /> };
    } else if (stock <= stockMinimo) {
      return { color: 'orange', text: 'Bajo', icon: <ExclamationCircleOutlined /> };
    } else {
      return { color: 'green', text: 'Disponible', icon: <CheckCircleOutlined /> };
    }
  };

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      width: '25%',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.categoria}</div>
        </div>
      ),
    },
    {
      title: 'Stock Actual',
      dataIndex: 'stock',
      key: 'stock',
      width: '15%',
      align: 'center',
      render: (stock, record) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{stock || 0}</span>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.unidadMedida || 'unidades'}</span>
          </div>
        );
      },
    },
    {
      title: 'Estado',
      key: 'estado',
      width: '15%',
      align: 'center',
      render: (_, record) => {
        const estado = obtenerEstadoStock(record);
        return (
          <Tag color={estado.color} icon={estado.icon}>
            {estado.text}
          </Tag>
        );
      },
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'stockMinimo',
      key: 'stockMinimo',
      width: '12%',
      align: 'center',
      render: (stockMinimo) => stockMinimo || 5,
    },
    {
      title: 'Disponibilidad',
      key: 'disponible',
      width: '13%',
      align: 'center',
      render: (_, record) => (
        <Tag color={record.disponible ? 'success' : 'default'}>
          {record.disponible ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: '20%',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirModalInventario(record)}
          >
            Gestionar
          </Button>
          <Button
            size="small"
            onClick={() => toggleDisponibilidad(record)}
            danger={record.disponible}
          >
            {record.disponible ? 'Desactivar' : 'Activar'}
          </Button>
        </Space>
      ),
    },
  ];

  // Calcular estadísticas
  const productosAgotados = productos.filter(p => (p.stock || 0) === 0).length;
  const productosBajoStock = productos.filter(p => {
    const stock = p.stock || 0;
    const stockMinimo = p.stockMinimo || 5;
    return stock > 0 && stock <= stockMinimo;
  }).length;
  const productosDisponibles = productos.filter(p => (p.stock || 0) > (p.stockMinimo || 5)).length;

  return (
    <AdminLayout>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InboxOutlined />
            <span>Gestión de Inventario</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={cargarProductos}
          >
            Actualizar
          </Button>
        }
      >
        {/* Estadísticas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }} className="fade-in">
          {cargando ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card size="small" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
                    {productosDisponibles}
                  </div>
                  <div style={{ color: '#15803d' }}>Productos Disponibles</div>
                </div>
              </Card>
              <Card size="small" style={{ background: '#fef3c7', border: '1px solid #fde047' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ca8a04' }}>
                    {productosBajoStock}
                  </div>
                  <div style={{ color: '#a16207' }}>Stock Bajo</div>
                </div>
              </Card>
              <Card size="small" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
                    {productosAgotados}
                  </div>
                  <div style={{ color: '#991b1b' }}>Agotados</div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Tabla de Productos */}
        <Table
          columns={columns}
          dataSource={productos}
          rowKey="_id"
          loading={cargando}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} productos`
          }}
        />
      </Card>

      {/* Modal de Gestión de Inventario */}
      <Modal
        title={`Gestionar Inventario: ${productoEditando?.nombre}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={guardarInventario}
        >
          <Form.Item
            label="Stock Actual"
            name="stock"
            rules={[{ required: true, message: 'Ingresa el stock actual' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Stock Mínimo (Alerta)"
            name="stockMinimo"
            rules={[{ required: true, message: 'Ingresa el stock mínimo' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Unidad de Medida"
            name="unidadMedida"
            rules={[{ required: true, message: 'Selecciona la unidad' }]}
          >
            <Select size="large">
              <Option value="unidades">Unidades</Option>
              <Option value="kg">Kilogramos (kg)</Option>
              <Option value="g">Gramos (g)</Option>
              <Option value="l">Litros (L)</Option>
              <Option value="ml">Mililitros (ml)</Option>
              <Option value="porciones">Porciones</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default GestionInventario;
