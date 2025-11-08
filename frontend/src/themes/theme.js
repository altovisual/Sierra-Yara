// Colores de la marca (ajusta estos valores según tu paleta de colores)
export const theme = {
  token: {
    // Color primario - Usado para botones, enlaces, elementos interactivos
    colorPrimary: '#1890ff',
    // Color de éxito
    colorSuccess: '#52c41a',
    // Color de advertencia
    colorWarning: '#faad14',
    // Color de error
    colorError: '#f5222d',
    // Color de texto principal
    colorText: 'rgba(0, 0, 0, 0.85)',
    // Color de texto secundario
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    // Color de fondo del layout
    colorBgLayout: '#f0f2f5',
    // Color de fondo del encabezado
    colorBgHeader: '#001529',
    // Radio de borde
    borderRadius: 4,
    // Altura del encabezado
    headerHeight: 64,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      headerColor: '#fff',
      headerHeight: 64,
      headerPadding: '0 24px',
      headerColorBgDefault: '#001529',
      siderBg: '#fff',
      triggerBg: '#002140',
      triggerColor: '#fff',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemColor: 'rgba(255, 255, 255, 0.65)',
      darkItemSelectedBg: '#1890ff',
      darkItemSelectedColor: '#fff',
      itemHoverBg: 'rgba(24, 144, 255, 0.1)',
      itemSelectedBg: 'rgba(24, 144, 255, 0.1)',
      itemSelectedColor: '#1890ff',
    },
    Card: {
      colorBgContainer: '#fff',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      borderRadiusLG: 8,
    },
  },
};

export default theme;
