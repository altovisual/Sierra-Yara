# Backend - Sierra Yara

API REST con WebSockets para el sistema de menú inteligente.

## 🛠️ Tecnologías

- **Node.js** v16+
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM
- **Socket.io** - WebSockets
- **dotenv** - Variables de entorno

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crear archivo `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sierra_yara
CORS_ORIGIN=http://localhost:3000

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

## 🚀 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Poblar base de datos
node scripts/seedData.js
```

## 📁 Estructura

```
backend/
├── config/
│   └── database.js          # Configuración MongoDB
├── controllers/
│   ├── productoController.js
│   ├── mesaController.js
│   └── pedidoController.js
├── models/
│   ├── Producto.js
│   ├── Mesa.js
│   └── Pedido.js
├── routes/
│   ├── productos.js
│   ├── mesas.js
│   └── pedidos.js
├── scripts/
│   └── seedData.js          # Datos de ejemplo
├── server.js                # Punto de entrada
└── package.json
```

## 🔌 API Endpoints

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Mesas
- `GET /api/mesas` - Listar mesas
- `GET /api/mesas/:numeroMesa` - Obtener mesa
- `POST /api/mesas/:numeroMesa/conectar` - Conectar dispositivo
- `GET /api/mesas/:numeroMesa/cuenta` - Obtener cuenta

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado
- `POST /api/pedidos/:id/pagar` - Procesar pago

## 🔄 WebSocket Events

### Eventos del Cliente
- `unirse_mesa` - Unirse a sala de mesa
- `nuevo_pedido` - Notificar nuevo pedido
- `actualizar_estado_pedido` - Actualizar estado

### Eventos del Servidor
- `pedido_actualizado` - Pedido actualizado
- `estado_pedido_actualizado` - Estado cambió
- `pedido_nuevo_admin` - Nuevo pedido (admin)

## 🗄️ Modelos de Datos

### Producto
```javascript
{
  nombre: String,
  descripcion: String,
  precio: Number,
  imagenUrl: String,
  categoria: String,
  disponible: Boolean
}
```

### Mesa
```javascript
{
  numeroMesa: Number,
  estado: String, // 'libre', 'ocupada', 'esperando_pago'
  pedidos: [ObjectId],
  dispositivosActivos: [Object],
  totalMesa: Number
}
```

### Pedido
```javascript
{
  mesaId: ObjectId,
  dispositivoId: String,
  nombreUsuario: String,
  items: [Object],
  total: Number,
  estado: String, // 'recibido', 'en_preparacion', 'listo', 'entregado'
  propina: Number,
  metodoPago: String,
  pagado: Boolean
}
```

## 🔐 Seguridad

- Validación de datos con Mongoose
- CORS configurado
- Variables de entorno para datos sensibles
- Manejo de errores centralizado

## 📝 Scripts

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```
