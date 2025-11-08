import React, { useState, useEffect } from 'react';
import { Card, Empty, Tag, Spin, Row, Col } from 'antd';
import { 
  TagOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined
} from '@ant-design/icons';
import { promocionesAPI } from '../../services/api';
import { formatearPrecio } from '../../utils/helpers';
import dayjs from 'dayjs';

const Promociones = () => {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPromociones();
  }, []);

  const cargarPromociones = async () => {
    try {
      const response = await promocionesAPI.obtenerActivas();
      setPromociones(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (promociones.length === 0) {
    return (
      <div style={{ padding: '40px 20px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hay promociones activas en este momento"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold',
          margin: 0,
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          <TagOutlined /> Promociones del Día
        </h2>
        <p style={{ color: '#666', margin: 0 }}>
          Aprovecha nuestras ofertas especiales
        </p>
      </div>

      <Row gutter={[16, 16]}>
        {promociones.map((promo) => (
          <Col xs={24} sm={12} lg={8} key={promo._id}>
            <Card
              hoverable
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: promo.destacada ? '2px solid #fbbf24' : '1px solid #f0f0f0',
                boxShadow: promo.destacada 
                  ? '0 4px 12px rgba(251, 191, 36, 0.3)' 
                  : '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%'
              }}
            >
              {/* Header con descuento */}
              <div style={{
                background: promo.destacada 
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px',
                marginTop: '-24px',
                marginLeft: '-24px',
                marginRight: '-24px',
                marginBottom: '16px',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                  {promo.tipoDescuento === 'porcentaje' ? 'DESCUENTO' : 'AHORRA'}
                </div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1 }}>
                  {promo.tipoDescuento === 'porcentaje' 
                    ? `${promo.descuento}%`
                    : formatearPrecio(promo.descuento)}
                </div>
                {promo.destacada && (
                  <Tag 
                    color="white" 
                    style={{ 
                      marginTop: '8px',
                      color: '#f59e0b',
                      fontWeight: 'bold',
                      border: 'none'
                    }}
                  >
                    ⭐ DESTACADA
                  </Tag>
                )}
              </div>

              {/* Contenido */}
              <div>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  color: '#1f2937'
                }}>
                  {promo.titulo}
                </h3>
                
                <p style={{ 
                  color: '#6b7280',
                  marginBottom: '16px',
                  lineHeight: 1.6
                }}>
                  {promo.descripcion}
                </p>

                {/* Productos aplicables */}
                {promo.productos && promo.productos.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      Productos:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {promo.productos.slice(0, 3).map((producto) => (
                        <Tag key={producto._id} color="blue" style={{ margin: 0 }}>
                          {producto.nombre}
                        </Tag>
                      ))}
                      {promo.productos.length > 3 && (
                        <Tag color="default" style={{ margin: 0 }}>
                          +{promo.productos.length - 3} más
                        </Tag>
                      )}
                    </div>
                  </div>
                )}

                {/* Información de vigencia */}
                <div style={{ 
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '12px',
                  marginTop: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '6px'
                  }}>
                    <CalendarOutlined />
                    <span>
                      Válido hasta: {dayjs(promo.fechaFin).format('DD/MM/YYYY')}
                    </span>
                  </div>

                  {promo.horaInicio && promo.horaFin && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '6px'
                    }}>
                      <ClockCircleOutlined />
                      <span>
                        Horario: {promo.horaInicio} - {promo.horaFin}
                      </span>
                    </div>
                  )}

                  {promo.diasSemana && promo.diasSemana.length > 0 && (
                    <div style={{ 
                      fontSize: '11px',
                      color: '#6b7280',
                      marginTop: '8px'
                    }}>
                      Días: {promo.diasSemana.map(d => 
                        d.charAt(0).toUpperCase() + d.slice(1)
                      ).join(', ')}
                    </div>
                  )}
                </div>

                {/* Condiciones */}
                {promo.condiciones && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    {promo.condiciones}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Promociones;
