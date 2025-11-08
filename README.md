# 🏔️ Sierra Yara - Sistema de Menú Inteligente

Sistema completo de menú digital con gestión de pedidos en tiempo real para restaurantes y cafeterías.

## 📋 Características Principales

### Para Clientes
- ✅ Acceso al menú mediante código QR por mesa
- ✅ Navegación intuitiva del menú por categorías
- ✅ Carrito de compras individual
- ✅ Seguimiento de pedidos en tiempo real
- ✅ División automática de cuenta por persona
- ✅ Múltiples métodos de pago (Pago Móvil, Transferencia, Efectivo, Zelle, Punto de Venta)
- ✅ Sistema de propinas integrado
- ✅ Aplicación Web Progresiva (PWA) - funciona como app nativa

### Para Administradores
- ✅ Panel de control en tiempo real
- ✅ Gestión de mesas y su estado
- ✅ Visualización de pedidos activos
- ✅ Actualización de estado de pedidos
- ✅ Notificaciones instantáneas de nuevos pedidos
- ✅ Estadísticas de ventas del día
- ✅ Gestión completa del menú (CRUD)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express** - Servidor y API REST
- **MongoDB** + **Mongoose** - Base de datos
- **Socket.io** - Comunicación en tiempo real
- **dotenv** - Gestión de variables de entorno

### Frontend
- **React 18** - Framework de UI
- **React Router** - Navegación
- **Tailwind CSS** - Estilos modernos
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSockets
- **Lucide React** - Iconos

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

## 📈 Mejoras Futuras

- [ ] Sistema de autenticación para administradores
- [ ] Reportes y analytics avanzados
- [ ] Integración con impresoras de cocina
- [ ] Sistema de reservas
- [ ] Programa de lealtad y puntos
- [ ] Notificaciones push
- [ ] Múltiples idiomas
- [ ] Modo oscuro
- [ ] Integración con pasarelas de pago

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
