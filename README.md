# 🏔️ Sierra Yara - Sistema de Menú Inteligente

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://sierra-yara.vercel.app)
[![Backend](https://img.shields.io/badge/backend-online-blue)](https://sierra-yara.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Sistema completo de menú digital con gestión de pedidos en tiempo real, tasa BCV automática y panel de administración avanzado.

🌐 **Demo en Vivo:** [sierra-yara.vercel.app](https://sierra-yara.vercel.app)  
📊 **Panel Admin:** [sierra-yara.vercel.app/admin](https://sierra-yara.vercel.app/admin)

## 📋 Características Principales

### Para Clientes
- ✅ Acceso al menú mediante código QR por mesa
- ✅ Navegación intuitiva del menú por categorías
- ✅ **Precios duales (USD y Bs)** con tasa BCV en tiempo real
- ✅ Sistema de favoritos
- ✅ Carrito de compras con persistencia
- ✅ Aplicación de promociones automáticas
- ✅ Seguimiento de pedidos en tiempo real
- ✅ Múltiples métodos de pago
- ✅ Sistema de propinas integrado
- ✅ **PWA instalable** - funciona como app nativa
- ✅ **Sesión persistente** - no pierde datos al cerrar navegador
- ✅ Botón de llamar mesonero

### Para Administradores
- ✅ Dashboard en tiempo real con estadísticas
- ✅ Gestión completa de pedidos (CRUD)
- ✅ Gestión de productos y categorías
- ✅ **Sistema de promociones** con horarios y días específicos
- ✅ **Control de inventario** con alertas de stock bajo
- ✅ **Gestión de tasa BCV** automática (cada 6h) y manual
- ✅ **Gestión de clientes** con segmentación y marketing
- ✅ **Reportes avanzados** en Excel y PDF profesionales
- ✅ Generador de códigos QR por mesa
- ✅ Notificaciones instantáneas con sonido
- ✅ Visualización de mesas en tiempo real
- ✅ Estadísticas de ventas y reportes
- ✅ **Panel 100% responsive** - móvil, tablet y desktop
- ✅ **Sesión sin expiración** para administradores
- ✅ **Keep-alive automático** en Render

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** - Servidor y API REST
- **MongoDB** + **Mongoose** - Base de datos NoSQL
- **Socket.io** - Comunicación en tiempo real
- **JWT** - Autenticación segura
- **PDFKit** - Generación de reportes PDF
- **ExcelJS** - Generación de reportes Excel
- **Axios** - Cliente HTTP para APIs externas
- **Node-cron** - Tareas programadas
- **dotenv** - Gestión de variables de entorno

### Frontend
- **React 18** - Framework de UI
- **React Router** - Navegación
- **Tailwind CSS** - Estilos modernos y responsive
- **Ant Design** - Componentes UI profesionales
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSockets
- **Lucide React** - Iconos
- **Day.js** - Manejo de fechas
- **QRCode.react** - Generación de códigos QR

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (v5 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
cd sierra_yara
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sierra_yara
CORS_ORIGIN=http://localhost:3000

# Datos de pago del local
PAGO_MOVIL_CI=V12345678
PAGO_MOVIL_TELEFONO=04141234567
PAGO_MOVIL_BANCO=Banco de Venezuela

TRANSFERENCIA_BANCO=Banco de Venezuela
TRANSFERENCIA_CUENTA=01020123456789012345
TRANSFERENCIA_TITULAR=Nombre del Titular
TRANSFERENCIA_RIF=J123456789

ZELLE_EMAIL=pagos@sierrayara.com
PAYPAL_EMAIL=pagos@sierrayara.com
```

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Editar `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Ejecución

### Modo Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

El backend estará disponible en `http://localhost:5000`
El frontend estará disponible en `http://localhost:3000`

### Modo Producción

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

## 📱 Uso del Sistema

### Para Clientes

1. **Escanear QR de la mesa** o ingresar el número de mesa manualmente
2. **Explorar el menú** y agregar productos al carrito
3. **Confirmar el pedido** con notas especiales si es necesario
4. **Ver el estado** del pedido en tiempo real
5. **Pagar** cuando esté listo, eligiendo el método preferido
6. **Agregar propina** para el mesonero

### Para Administradores

Acceder al panel de administración en: `http://localhost:3000/admin`

1. **Monitorear mesas** y su estado en tiempo real
2. **Gestionar pedidos** actualizando su estado (Recibido → En Preparación → Listo → Entregado)
3. **Recibir notificaciones** de nuevos pedidos con alerta sonora
4. **Ver estadísticas** de ventas y actividad del día
5. **Gestionar el menú** (agregar/editar/eliminar productos)

## 🗂️ Estructura del Proyecto

```
sierra_yara/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── productoController.js
│   │   ├── mesaController.js
│   │   └── pedidoController.js
│   ├── models/
│   │   ├── Producto.js
│   │   ├── Mesa.js
│   │   └── Pedido.js
│   ├── routes/
│   │   ├── productos.js
│   │   ├── mesas.js
│   │   └── pedidos.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── cliente/
    │   │   │   ├── EscanearQR.js
    │   │   │   ├── Menu.js
    │   │   │   ├── Carrito.js
    │   │   │   ├── MisPedidos.js
    │   │   │   └── Pago.js
    │   │   └── admin/
    │   │       └── Dashboard.js
    │   ├── context/
    │   │   ├── MesaContext.js
    │   │   └── CarritoContext.js
    │   ├── services/
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── .env
```

## 🔌 API Endpoints

### Productos
- `GET /api/productos` - Obtener todos los productos
- `GET /api/productos/:id` - Obtener un producto
- `POST /api/productos` - Crear producto (Admin)
- `PUT /api/productos/:id` - Actualizar producto (Admin)
- `DELETE /api/productos/:id` - Eliminar producto (Admin)

### Mesas
- `GET /api/mesas` - Obtener todas las mesas (Admin)
- `GET /api/mesas/:numeroMesa` - Obtener mesa por número
- `POST /api/mesas/:numeroMesa/conectar` - Conectar dispositivo a mesa
- `GET /api/mesas/:numeroMesa/cuenta` - Obtener cuenta de la mesa
- `POST /api/mesas/:id/cerrar` - Cerrar mesa (Admin)

### Pedidos
- `GET /api/pedidos` - Obtener todos los pedidos (Admin)
- `GET /api/pedidos/:id` - Obtener un pedido
- `GET /api/pedidos/dispositivo/:dispositivoId` - Obtener pedidos por dispositivo
- `POST /api/pedidos` - Crear nuevo pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado (Admin)
- `POST /api/pedidos/:id/pagar` - Procesar pago
- `DELETE /api/pedidos/:id` - Cancelar pedido (Admin)

### Configuración
- `GET /api/config/pago` - Obtener datos de pago del local
- `GET /api/health` - Verificar estado del servidor

## 🔄 WebSocket Events

### Cliente → Servidor
- `unirse_mesa` - Unirse a la sala de una mesa
- `nuevo_pedido` - Notificar nuevo pedido
- `actualizar_estado_pedido` - Actualizar estado de pedido
- `llamar_mesonero` - Solicitar atención del mesonero

### Servidor → Cliente
- `pedido_actualizado` - Pedido actualizado en la mesa
- `estado_pedido_actualizado` - Estado de pedido cambió
- `pedido_nuevo_admin` - Nuevo pedido (para admin)
- `mesonero_solicitado` - Solicitud de mesonero (para admin)
- `cuenta_actualizada` - Cuenta de mesa actualizada

## 🎨 Personalización

### Colores del Tema
Editar `frontend/tailwind.config.js` para cambiar los colores:
```javascript
colors: {
  primary: {
    // Personalizar colores principales
  },
  cafe: {
    // Personalizar colores secundarios
  }
}
```

### Categorías del Menú
Las categorías están definidas en `backend/models/Producto.js`:
```javascript
categoria: {
  enum: ['Bebidas Calientes', 'Bebidas Frías', 'Desayunos', 'Almuerzos', 'Postres', 'Snacks']
}
```

## 🔐 Seguridad

- Las variables de entorno sensibles deben mantenerse en `.env` (nunca en el repositorio)
- En producción, implementar autenticación para rutas de administración
- Configurar CORS apropiadamente para el dominio de producción
- Usar HTTPS en producción
- Implementar rate limiting para prevenir abuso de la API

## 📚 Documentación

- 📖 **[Documentación Técnica Completa](DOCUMENTACION_TECNICA.md)** - Arquitectura, modelos, API, contextos
- 📄 **[Whitepaper](WHITEPAPER.md)** - Propuesta de valor, casos de uso, ROI
- 💾 **[Persistencia de Datos](PERSISTENCIA_DATOS.md)** - LocalStorage, caché, estrategias
- 💱 **[Sistema de Tasa BCV](TASA_BCV_README.md)** - Configuración, uso, APIs
- 🚀 **[Guía de Despliegue](DEPLOY_RENDER.md)** - Render, Vercel, troubleshooting

## 🆕 Características Recientes

### ✅ Panel Admin 100% Responsive (v2.0 - Nov 2025)
- **Vista adaptativa** - Cards en móvil, tablas en desktop
- **Productos responsive** - Grid 1/2/3 columnas según pantalla
- **Promociones responsive** - Switches mejorados y táctiles
- **Clientes responsive** - Cards con estadísticas visuales
- **Pedidos responsive** - Modal optimizado para móvil
- **Inputs táctiles** - 44px altura, fuente 16px (evita zoom iOS)
- **Botones grandes** - Mínimo 40-44px para fácil toque
- **Animaciones suaves** - Fade-in y hover effects
- **Diseño profesional** - Mantiene identidad Sierra Yara

### ✅ Gestión de Clientes y Marketing (v2.0)
- **Segmentación automática** - Nuevo, Regular, Frecuente, VIP, Inactivo
- **Base de datos completa** - Nombre, cédula, teléfono, email
- **Estadísticas por cliente** - Pedidos, gasto total, visitas
- **Productos preferidos** - Análisis de consumo
- **Exportación para marketing** - CSV con clientes que aceptan marketing
- **Reportes PDF** - Reporte completo de clientes
- **Filtros avanzados** - Por segmento y búsqueda

### ✅ Reportes Profesionales (v2.0)
- **Reportes Excel** - Ventas, productos, clientes
- **Reportes PDF empresariales** - Diseño limpio y profesional
- **Estado de cuenta detallado** - PDF con todos los pedidos
- **Reporte de clientes** - PDF con estadísticas completas
- **Gráficos y tablas** - Visualización clara de datos
- **Descarga directa** - Sin abrir en navegador

### ✅ Sistema de Tasa BCV (v1.0)
- Actualización automática cada 6 horas desde API externa
- Conversión USD → Bs en tiempo real
- Panel admin para gestión manual
- Histórico completo de cambios
- Estadísticas de variación

### ✅ Persistencia Completa (v1.0)
- Sesión de mesa en localStorage
- Carrito persistente
- Favoritos guardados
- Promociones aplicadas
- Auto-restauración al reabrir

### ✅ Infraestructura Mejorada (v2.0)
- **Sesión sin expiración** - Administradores no pierden sesión
- **Keep-alive automático** - Backend siempre activo en Render
- **Health check** - Monitoreo de estado del servidor
- **Manejo de errores** - Sistema robusto sin crashes

## 📈 Roadmap

### Fase 1: MVP ✅ (Completado)
- [x] Sistema de mesas y pedidos
- [x] Panel de administración
- [x] Gestión de productos
- [x] Sistema de tasa BCV
- [x] Notificaciones en tiempo real
- [x] Generador de QR
- [x] PWA instalable
- [x] Persistencia de datos

### Fase 2: Optimización ✅ (Completado)
- [x] Gestión de promociones
- [x] Control de inventario
- [x] Reportes avanzados (Excel y PDF)
- [x] Gestión de clientes y marketing
- [x] Panel admin 100% responsive
- [x] Sesión persistente para admin
- [x] Keep-alive automático
- [ ] Modo offline completo
- [ ] Sistema de autenticación avanzado

### Fase 3: Expansión 📅 (Q1 2026)
- [ ] Notificaciones push
- [ ] Sistema de reservas
- [ ] Integración con POS
- [ ] Programa de lealtad
- [ ] Múltiples idiomas
- [ ] App móvil nativa

### Fase 4: Inteligencia 🤖 (Q2 2026)
- [ ] Recomendaciones con IA
- [ ] Análisis predictivo
- [ ] Optimización automática de precios
- [ ] Chatbot de atención

## 🤝 Contribución

Para sugerencias o mejoras, contactar al equipo de desarrollo de Altovisual.

## 📄 Licencia

MIT License - Copyright © 2024 Altovisual

## 📞 Contacto

**Altovisual**
- GitHub: [@altovisual](https://github.com/altovisual)
- Repositorio: [Sierra-Yara](https://github.com/altovisual/Sierra-Yara)

---

Desarrollado con ❤️ por Altovisual
