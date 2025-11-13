import React, { useState } from 'react';
import { reportesAPI } from '../../services/api';
import AdminLayout from './AdminLayout';
import {
  Card,
  Button,
  DatePicker,
  Space,
  Row,
  Col,
  Typography,
  message,
  Divider,
  Alert
} from 'antd';
import {
  FileExcelOutlined,
  FilePdfOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

/**
 * Componente para generar y descargar reportes en Excel
 */
const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [descargando, setDescargando] = useState(null);

  const handleDescargarReporte = (tipo, formato = 'excel') => {
    const key = `${tipo}-${formato}`;
    setDescargando(key);
    
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    try {
      if (formato === 'excel') {
        switch (tipo) {
          case 'ventas':
            reportesAPI.descargarReporteVentas(params);
            break;
          case 'productos':
            reportesAPI.descargarReporteProductos(params);
            break;
          case 'completo':
            reportesAPI.descargarReporteCompleto(params);
            break;
          default:
            break;
        }
      } else if (formato === 'pdf') {
        switch (tipo) {
          case 'ventas':
            reportesAPI.descargarReporteVentasPDF(params);
            break;
          case 'productos':
            reportesAPI.descargarReporteProductosPDF(params);
            break;
          case 'completo':
            reportesAPI.descargarReporteCompletoPDF(params);
            break;
          default:
            break;
        }
      }
      
      message.success(`Descargando reporte en ${formato.toUpperCase()}...`);
      setTimeout(() => setDescargando(null), 2000);
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      message.error('Error al generar el reporte. Por favor intenta de nuevo.');
      setDescargando(null);
    }
  };

  const establecerRangoRapido = (dias) => {
    const hoy = dayjs();
    const inicio = dayjs().subtract(dias, 'day');
    
    setFechaInicio(inicio.format('YYYY-MM-DD'));
    setFechaFin(hoy.format('YYYY-MM-DD'));
  };

  const limpiarFechas = () => {
    setFechaInicio(null);
    setFechaFin(null);
  };

  const handleRangeChange = (dates) => {
    if (dates) {
      setFechaInicio(dates[0].format('YYYY-MM-DD'));
      setFechaFin(dates[1].format('YYYY-MM-DD'));
    } else {
      limpiarFechas();
    }
  };

  return (
    <AdminLayout title="Reportes y Exportación">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* Filtros de Fecha */}
        <Card title="Filtrar por Rango de Fechas">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder={['Fecha Inicio', 'Fecha Fin']}
              onChange={handleRangeChange}
              value={fechaInicio && fechaFin ? [dayjs(fechaInicio), dayjs(fechaFin)] : null}
            />
            
            <Space wrap>
              <Button onClick={() => establecerRangoRapido(7)}>
                Últimos 7 días
              </Button>
              <Button onClick={() => establecerRangoRapido(30)}>
                Últimos 30 días
              </Button>
              <Button onClick={() => establecerRangoRapido(90)}>
                Últimos 3 meses
              </Button>
              <Button danger onClick={limpiarFechas}>
                Limpiar filtros
              </Button>
            </Space>

            {(fechaInicio || fechaFin) && (
              <Alert
                message={`Reportes filtrados: ${fechaInicio || 'Inicio'} → ${fechaFin || 'Hoy'}`}
                type="info"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Tarjetas de Reportes */}
        <Row gutter={[16, 16]}>
          {/* Reporte de Ventas */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <DollarOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  <Title level={4} style={{ margin: 0 }}>Reporte de Ventas</Title>
                </div>
                
                <Paragraph type="secondary">
                  Detalle completo de todas las ventas con información de pedidos, productos, métodos de pago y propinas.
                </Paragraph>
                
                <ul style={{ paddingLeft: '20px', color: '#8c8c8c' }}>
                  <li>Fecha y hora de venta</li>
                  <li>Productos vendidos</li>
                  <li>Métodos de pago</li>
                  <li>Propinas y totales</li>
                </ul>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={() => handleDescargarReporte('ventas', 'excel')}
                    loading={descargando === 'ventas-excel'}
                    block
                  >
                    {descargando === 'ventas-excel' ? 'Generando...' : 'Descargar Excel'}
                  </Button>
                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={() => handleDescargarReporte('ventas', 'pdf')}
                    loading={descargando === 'ventas-pdf'}
                    block
                  >
                    {descargando === 'ventas-pdf' ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          {/* Reporte de Productos */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShoppingOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
                  <Title level={4} style={{ margin: 0 }}>Productos Más Vendidos</Title>
                </div>
                
                <Paragraph type="secondary">
                  Análisis de productos ordenados por cantidad vendida con estadísticas de ventas.
                </Paragraph>
                
                <ul style={{ paddingLeft: '20px', color: '#8c8c8c' }}>
                  <li>Ranking de productos</li>
                  <li>Unidades vendidas</li>
                  <li>Ingresos por producto</li>
                  <li>Promedio por venta</li>
                </ul>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={() => handleDescargarReporte('productos', 'excel')}
                    loading={descargando === 'productos-excel'}
                    block
                  >
                    {descargando === 'productos-excel' ? 'Generando...' : 'Descargar Excel'}
                  </Button>
                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={() => handleDescargarReporte('productos', 'pdf')}
                    loading={descargando === 'productos-pdf'}
                    block
                  >
                    {descargando === 'productos-pdf' ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>

          {/* Reporte Completo */}
          <Col xs={24} md={8}>
            <Card
              hoverable
              style={{ height: '100%', borderColor: '#1890ff' }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                  <Title level={4} style={{ margin: 0 }}>Reporte Completo</Title>
                </div>
                
                <Paragraph type="secondary">
                  Reporte integral con múltiples hojas: resumen general, ventas, productos y análisis por mesa.
                </Paragraph>
                
                <ul style={{ paddingLeft: '20px', color: '#8c8c8c' }}>
                  <li>📊 Resumen general</li>
                  <li>💰 Ventas detalladas</li>
                  <li>📦 Productos vendidos</li>
                  <li>🪑 Análisis por mesa</li>
                </ul>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={() => handleDescargarReporte('completo', 'excel')}
                    loading={descargando === 'completo-excel'}
                    block
                  >
                    {descargando === 'completo-excel' ? 'Generando...' : 'Descargar Excel'}
                  </Button>
                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={() => handleDescargarReporte('completo', 'pdf')}
                    loading={descargando === 'completo-pdf'}
                    block
                  >
                    {descargando === 'completo-pdf' ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Información adicional */}
        <Card>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileExcelOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <Title level={5} style={{ margin: 0 }}>Información sobre los reportes</Title>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <ul style={{ paddingLeft: '20px', color: '#595959' }}>
              <li>Los reportes se generan en formato Excel (.xlsx) compatible con Microsoft Excel, Google Sheets y LibreOffice</li>
              <li>Todos los montos están expresados en dólares ($)</li>
              <li>Solo se incluyen pedidos confirmados como pagados</li>
              <li>Si no seleccionas fechas, se exportarán todos los datos disponibles</li>
              <li>Los archivos se descargan automáticamente al hacer clic en "Descargar Excel"</li>
            </ul>
          </Space>
        </Card>
      </Space>
    </AdminLayout>
  );
};

export default Reportes;
