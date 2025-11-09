import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Button, Input, Form, message, Table, Tag, Spin, Modal } from 'antd';
import { ReloadOutlined, DollarOutlined, LineChartOutlined, EditOutlined, ApiOutlined } from '@ant-design/icons';
import tasaBCVAPI from '../../services/tasaBCVAPI';

/**
 * Componente para gestionar la tasa BCV desde el panel admin
 */
const GestionTasaBCV = () => {
  const [form] = Form.useForm();
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [tasaActual, setTasaActual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  const cargarTasaActual = useCallback(async () => {
    try {
      const response = await tasaBCVAPI.obtenerTasaActual();
      setTasaActual(response.data.data);
    } catch (error) {
      console.error('Error al cargar tasa actual:', error);
    }
  }, []);

  const cargarHistorico = useCallback(async () => {
    try {
      const response = await tasaBCVAPI.obtenerHistorico(10);
      setHistorico(response.data.data);
    } catch (error) {
      console.error('Error al cargar histórico:', error);
    }
  }, []);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const response = await tasaBCVAPI.obtenerEstadisticas(30);
      setEstadisticas(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      await Promise.all([
        cargarTasaActual(),
        cargarHistorico(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      message.error('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }, [cargarTasaActual, cargarHistorico, cargarEstadisticas]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const actualizarDesdeAPI = async () => {
    Modal.confirm({
      title: '¿Actualizar tasa desde API?',
      content: 'Esto obtendrá la tasa actual desde la API externa y actualizará el sistema.',
      okText: 'Sí, actualizar',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setActualizando(true);
          const response = await tasaBCVAPI.actualizarDesdeAPI();
          message.success(`Tasa actualizada: Bs. ${response.data.data.valor}`);
          cargarDatos();
        } catch (error) {
          message.error('Error al actualizar desde API');
        } finally {
          setActualizando(false);
        }
      }
    });
  };

  const actualizarManual = async (values) => {
    try {
      setActualizando(true);
      const response = await tasaBCVAPI.actualizarManual(
        parseFloat(values.valor),
        'Admin',
        values.notas || ''
      );
      message.success(`Tasa actualizada manualmente: Bs. ${response.data.data.valor}`);
      form.resetFields();
      cargarDatos();
    } catch (error) {
      message.error('Error al actualizar tasa');
    } finally {
      setActualizando(false);
    }
  };

  const columnas = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (fecha) => new Date(fecha).toLocaleString('es-VE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      title: 'Valor',
      dataIndex: 'valor',
      key: 'valor',
      render: (valor) => <span style={{ fontWeight: 'bold', color: '#1890ff' }}>Bs. {valor.toFixed(2)}</span>
    },
    {
      title: 'Fuente',
      dataIndex: 'fuente',
      key: 'fuente',
      render: (fuente) => (
        <Tag color={fuente === 'api' ? 'blue' : 'orange'}>
          {fuente === 'api' ? 'API Automática' : 'Manual'}
        </Tag>
      )
    },
    {
      title: 'Actualizado por',
      dataIndex: 'actualizadoPor',
      key: 'actualizadoPor'
    },
    {
      title: 'Notas',
      dataIndex: 'notas',
      key: 'notas',
      render: (notas) => notas || '-'
    }
  ];

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Cargando datos de tasa BCV..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          💱 Gestión de Tasa BCV
        </h1>
        <p style={{ color: '#666' }}>
          Administra la tasa de cambio Bolívar/Dólar del sistema
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tasa Actual"
                value={tasaActual?.valor}
                precision={2}
                prefix="Bs."
                valueStyle={{ color: '#1890ff' }}
                suffix={
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={cargarTasaActual}
                    size="small"
                  />
                }
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                {tasaActual && new Date(tasaActual.createdAt).toLocaleString('es-VE')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Promedio (30 días)"
                value={estadisticas.promedio}
                precision={2}
                prefix="Bs."
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Mínima"
                value={estadisticas.minima}
                precision={2}
                prefix="Bs."
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Máxima"
                value={estadisticas.maxima}
                precision={2}
                prefix="Bs."
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Acciones */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Actualizar desde API */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ApiOutlined /> Actualizar desde API
              </span>
            }
          >
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Obtiene la tasa actual desde la API externa (ExchangeRate-API)
            </p>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={actualizarDesdeAPI}
              loading={actualizando}
              size="large"
              block
            >
              Actualizar Ahora
            </Button>
            {tasaActual && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                <Tag color={tasaActual.fuente === 'api' ? 'blue' : 'orange'}>
                  Última actualización: {tasaActual.fuente === 'api' ? 'API' : 'Manual'}
                </Tag>
              </div>
            )}
          </Card>
        </Col>

        {/* Actualizar manualmente */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <EditOutlined /> Actualizar Manualmente
              </span>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={actualizarManual}
            >
              <Form.Item
                label="Nueva Tasa (Bs.)"
                name="valor"
                rules={[
                  { required: true, message: 'Ingresa el valor de la tasa' },
                  { type: 'number', min: 0.01, message: 'Debe ser mayor a 0' }
                ]}
              >
                <Input
                  type="number"
                  step="0.01"
                  prefix={<DollarOutlined />}
                  placeholder="36.50"
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Notas (opcional)"
                name="notas"
              >
                <Input.TextArea
                  placeholder="Ej: Ajuste manual por cambio oficial"
                  rows={2}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={actualizando}
                  size="large"
                  block
                >
                  Guardar Tasa
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Histórico */}
      <Card
        title={
          <span>
            <LineChartOutlined /> Histórico de Cambios (Últimos 10)
          </span>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={cargarHistorico}>
            Actualizar
          </Button>
        }
      >
        <Table
          dataSource={historico}
          columns={columnas}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default GestionTasaBCV;
