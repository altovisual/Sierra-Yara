import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, Form, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import logo from '../../assets/logo.png';

const { Title, Text } = Typography;

/**
 * Componente de Login para administradores
 */
const Login = () => {
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setCargando(true);
    const result = await login(values.email, values.password);
    setCargando(false);
    
    if (result.success) {
      navigate('/admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a4d4d 0%, #2f4547 50%, #1a3a3a 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Patrón decorativo de fondo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(47, 69, 71, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26, 77, 77, 0.4) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2f4547 0%, #1a4d4d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(47, 69, 71, 0.3)'
            }}>
              <img 
                src={logo} 
                alt="Sierra Yara" 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  objectFit: 'contain'
                }} 
              />
            </div>
            <Title level={2} style={{ margin: 0, color: '#2f4547', fontWeight: '700' }}>
              Sierra Yara
            </Title>
            <Text style={{ color: '#2f4547', fontSize: '15px', fontWeight: '500' }}>
              Panel de Administración
            </Text>
          </div>

          {/* Formulario */}
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Por favor ingrese su email' },
                { type: 'email', message: 'Email inválido' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Por favor ingrese su contraseña' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={cargando}
                icon={<LoginOutlined />}
                block
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #2f4547 0%, #1a4d4d 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(47, 69, 71, 0.3)'
                }}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>

          {/* Información adicional */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              © 2024 Sierra Yara. Todos los derechos reservados.
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
