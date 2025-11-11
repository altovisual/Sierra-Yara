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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div>
            <img 
              src={logo} 
              alt="Sierra Yara" 
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'contain',
                marginBottom: '16px'
              }} 
            />
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              Sierra Yara
            </Title>
            <Text type="secondary">Panel de Administración</Text>
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
                  fontWeight: '600'
                }}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>

          {/* Información adicional */}
          <div style={{ marginTop: '24px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              © 2024 Sierra Yara. Todos los derechos reservados.
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Login;
