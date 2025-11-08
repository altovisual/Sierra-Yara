import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Typography, Avatar, Badge, Dropdown, Drawer, Button } from 'antd';
import themeConfig from '../../themes/theme';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  QrcodeOutlined,
  MenuOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
  CloseOutlined,
  TagOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = ({ children, title, extra }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // En móvil, el menú debe estar colapsado por defecto
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: 'pedidos',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/pedidos">Pedidos</Link>,
    },
    {
      key: 'productos',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/productos">Productos</Link>,
    },
    {
      key: 'promociones',
      icon: <TagOutlined />,
      label: <Link to="/admin/promociones">Promociones</Link>,
    },
    {
      key: 'qr',
      icon: <QrcodeOutlined />,
      label: <Link to="/admin/generar-qr">Generar QR</Link>,
    },
  ];

  // Obtener la ruta actual para resaltar el ítem del menú activo
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'dashboard';
    if (path.includes('/pedidos')) return 'pedidos';
    if (path.includes('/productos')) return 'productos';
    if (path.includes('/promociones')) return 'promociones';
    if (path.includes('/generar-qr')) return 'qr';
    return 'dashboard';
  };
  
  const selectedKey = getSelectedKey();

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Perfil',
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
    },
  ];

  const renderSider = () => {
    const menuContent = (
      <>
        <div className="logo" style={{
          height: '64px',
          padding: isMobile ? '16px' : '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'center',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '8px'
        }}>
          <div style={{ 
            color: '#1890ff', 
            fontSize: isMobile ? '20px' : '18px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {!collapsed || isMobile ? 'Admin Panel' : 'AP'}
          </div>
          {isMobile && (
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={closeDrawer}
              style={{ marginLeft: 'auto' }}
            />
          )}
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={closeDrawer}
          items={items}
          inlineCollapsed={collapsed && !isMobile}
          style={{ 
            borderRight: 0, 
            padding: isMobile ? '8px' : 0
          }}
        />
      </>
    );

    if (isMobile) {
      return (
        <Drawer
          title="Menú"
          placement="left"
          onClose={closeDrawer}
          open={drawerVisible}
          width={250}
          styles={{ 
            body: { padding: 0 },
            header: { padding: '16px' }
          }}
        >
          {menuContent}
        </Drawer>
      );
    }

    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.05)',
          background: '#fff',
          zIndex: 10,
          transition: 'all 0.1s'
        }}
      >
        {menuContent}
      </Sider>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: themeConfig.token,
        components: {
          ...themeConfig.components,
          Layout: {
            headerBg: '#fff',
            headerPadding: '0 16px',
            headerHeight: 56,
          },
        },
      }}
    >
      <Layout style={{ 
        minHeight: '100vh', 
        background: themeConfig.token.colorBgLayout,
        position: 'relative'
      }}>
        {renderSider()}
        
        <Layout 
          style={{ 
            marginLeft: isMobile ? 0 : (collapsed ? 80 : 250), 
            transition: 'all 0.1s',
            minHeight: '100vh',
            position: 'relative'
          }}
        >
          <Header
            style={{
              padding: '0 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
              position: 'sticky',
              top: 0,
              zIndex: 9,
              height: '56px',
              lineHeight: '56px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isMobile ? (
                <MenuOutlined
                  style={{ fontSize: '20px', cursor: 'pointer' }}
                  onClick={toggleDrawer}
                />
              ) : (
                <MenuOutlined
                  style={{ fontSize: '18px', marginRight: '16px', cursor: 'pointer' }}
                  onClick={() => setCollapsed(!collapsed)}
                />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: '#1890ff',
                      verticalAlign: 'middle'
                    }} 
                  />
                  {!isMobile && !collapsed && (
                    <Text style={{ marginLeft: '4px' }}>Admin</Text>
                  )}
                </div>
              </Dropdown>
            </div>
          </Header>
          
          <Content
            style={{
              margin: isMobile ? '16px 8px' : '24px 16px',
              padding: 0,
              minHeight: 'calc(100vh - 120px)',
              background: 'transparent',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
