import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Typography, Avatar, Dropdown, Drawer, Button } from 'antd';
import NotificacionesPedidos from './NotificacionesPedidos';
import logo from '../../assets/logo.png';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  QrcodeOutlined,
  MenuOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  UserOutlined,
  CloseOutlined,
  TagOutlined,
  InboxOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined
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
      key: 'inventario',
      icon: <InboxOutlined />,
      label: <Link to="/admin/inventario">Inventario</Link>,
    },
    {
      key: 'tasa-bcv',
      icon: <DollarOutlined />,
      label: <Link to="/admin/tasa-bcv">Tasa BCV</Link>,
    },
    {
      key: 'reportes',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/reportes">Reportes</Link>,
    },
    {
      key: 'clientes',
      icon: <TeamOutlined />,
      label: <Link to="/admin/clientes">Clientes</Link>,
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
    if (path.includes('/inventario')) return 'inventario';
    if (path.includes('/tasa-bcv')) return 'tasa-bcv';
    if (path.includes('/reportes')) return 'reportes';
    if (path.includes('/clientes')) return 'clientes';
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '8px'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img 
              src={logo} 
              alt="Sierra Yara Logo" 
              style={{ 
                height: collapsed && !isMobile ? '40px' : '45px',
                width: 'auto',
                objectFit: 'contain',
                transition: 'all 0.2s'
              }} 
            />
            {(!collapsed || isMobile) && (
              <span style={{ 
                color: '#ffffff', 
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '0.5px'
              }}>
                Sierra Yara
              </span>
            )}
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
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={closeDrawer}
          items={items}
          inlineCollapsed={collapsed && !isMobile}
          style={{ 
            borderRight: 0, 
            padding: isMobile ? '8px' : 0,
            background: 'transparent'
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
          boxShadow: '2px 0 12px 0 rgba(0, 0, 0, 0.15)',
          background: '#3d5a5c',
          zIndex: 10,
          transition: 'all 0.1s'
        }}
      >
        {menuContent}
      </Sider>
    );
  };

  // Tema personalizado Sierra Yara
  const sierraYaraTheme = {
    token: {
      colorPrimary: '#456366', // Teal principal de Sierra Yara
      colorBgContainer: '#ffffff',
      colorBgLayout: '#f5f1e8', // Beige claro de fondo
      colorText: '#2c3e3f',
      colorTextSecondary: '#6b7c7d',
      borderRadius: 8,
      colorBorder: '#d4cfc4',
    },
    components: {
      Layout: {
        headerBg: '#456366', // Header con color Sierra Yara
        headerPadding: '0 16px',
        headerHeight: 56,
        siderBg: '#3d5a5c', // Sidebar con teal oscuro
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: 'rgba(255, 255, 255, 0.1)',
        itemSelectedColor: '#ffffff',
        itemColor: 'rgba(255, 255, 255, 0.85)',
        itemHoverBg: 'rgba(255, 255, 255, 0.08)',
        itemHoverColor: '#ffffff',
        iconSize: 18,
      },
      Button: {
        colorPrimary: '#456366',
        colorPrimaryHover: '#3d5a5c',
        colorPrimaryActive: '#2f4547',
      },
      Card: {
        colorBgContainer: '#ffffff',
        boxShadowTertiary: '0 1px 2px 0 rgba(61, 90, 92, 0.05)',
      },
      Tag: {
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#456366',
      },
    },
  };

  return (
    <ConfigProvider theme={sierraYaraTheme}>
      <Layout style={{ 
        minHeight: '100vh', 
        background: '#f5f1e8',
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
              background: '#456366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(61, 90, 92, 0.15)',
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
                  style={{ fontSize: '20px', cursor: 'pointer', color: '#ffffff' }}
                  onClick={toggleDrawer}
                />
              ) : (
                <MenuOutlined
                  style={{ fontSize: '18px', marginRight: '16px', cursor: 'pointer', color: '#ffffff' }}
                  onClick={() => setCollapsed(!collapsed)}
                />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <NotificacionesPedidos />
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
                      backgroundColor: '#2f4547',
                      verticalAlign: 'middle'
                    }} 
                  />
                  {!isMobile && !collapsed && (
                    <Text style={{ marginLeft: '4px', color: '#ffffff' }}>Admin</Text>
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
