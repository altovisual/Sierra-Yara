# Frontend - Sierra Yara Café

Aplicación Web Progresiva (PWA) para el sistema de menú inteligente.

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **Socket.io Client** - WebSockets
- **Lucide React** - Iconos

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crear archivo `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Ejecución

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Tests
npm test
```

## 📁 Estructura

```
frontend/
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
└── package.json
```

## 🎨 Componentes Principales

### Cliente
- **EscanearQR** - Conexión a mesa
- **Menu** - Catálogo de productos
- **Carrito** - Gestión de pedido
- **MisPedidos** - Estado de pedidos
- **Pago** - Procesamiento de pago

### Admin
- **Dashboard** - Panel de control

## 🔄 Contextos

### MesaContext
Gestiona la conexión del dispositivo a la mesa:
- `conectarMesa()`
- `actualizarMesa()`
- `desconectarMesa()`

### CarritoContext
Gestiona el carrito de compras:
- `agregarItem()`
- `eliminarItem()`
- `actualizarCantidad()`
- `limpiarCarrito()`

## 🎨 Personalización

### Colores
Editar `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#22c55e',
    600: '#16a34a',
    // ...
  }
}
```

### Fuentes
Editar en `public/index.html` y `tailwind.config.js`

## 📱 PWA

La aplicación es una PWA que:
- Funciona offline
- Se puede instalar en dispositivos
- Tiene iconos y splash screens
- Carga rápidamente

## 🔌 Servicios

### API Service
Cliente HTTP con Axios para todas las llamadas a la API.

### Socket Service
Cliente WebSocket para comunicación en tiempo real.

## 🎯 Rutas

```
/                    - Escanear QR
/mesa/:numeroMesa    - Acceso directo a mesa
/menu                - Menú de productos
/carrito             - Carrito de compras
/mis-pedidos         - Estado de pedidos
/pago/:pedidoId      - Procesar pago
/admin               - Panel de administración
```

## 🔐 LocalStorage

Se guarda:
- Sesión de mesa (mesaId, dispositivoId)
- Carrito de compras
- Preferencias del usuario

## 📝 Scripts Disponibles

```bash
npm start           # Servidor de desarrollo
npm run build       # Build para producción
npm test            # Ejecutar tests
npm run eject       # Exponer configuración
```

## 🎨 Estilos Tailwind

Clases personalizadas en `index.css`:
- `.btn-primary`
- `.btn-secondary`
- `.btn-outline`
- `.card`
- `.badge`
- `.input-field`

## 🌐 Navegadores Soportados

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)
- Navegadores móviles modernos
