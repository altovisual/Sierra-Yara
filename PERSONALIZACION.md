# 🎨 Guía de Personalización

Cómo personalizar Sierra Yara para tu negocio.

## 🏢 Información del Negocio

### 1. Nombre y Logo

**Frontend - `public/index.html`:**
```html
<title>Tu Café - Menú Digital</title>
<meta name="description" content="Sistema de menú inteligente para Tu Café" />
```

**Frontend - `src/components/cliente/EscanearQR.js`:**
```javascript
<h1 className="text-4xl font-display font-bold text-white mb-2">
  Tu Café
</h1>
```

### 2. Colores del Tema

**Frontend - `tailwind.config.js`:**
```javascript
colors: {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Color principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Agregar colores personalizados
  brand: {
    light: '#your-color',
    DEFAULT: '#your-color',
    dark: '#your-color',
  }
}
```

### 3. Fuentes

**Frontend - `public/index.html`:**
```html
<link href="https://fonts.googleapis.com/css2?family=TuFuente:wght@300;400;600;700&display=swap" rel="stylesheet">
```

**Frontend - `tailwind.config.js`:**
```javascript
fontFamily: {
  sans: ['TuFuente', 'system-ui', 'sans-serif'],
  display: ['TuFuenteDisplay', 'sans-serif'],
}
```

## 🍽️ Menú y Productos

### 1. Categorías

**Backend - `models/Producto.js`:**
```javascript
categoria: {
  type: String,
  required: true,
  enum: [
    'Bebidas Calientes',
    'Bebidas Frías',
    'Desayunos',
    'Almuerzos',
    'Postres',
    'Snacks',
    // Agregar tus categorías
    'Pizzas',
    'Ensaladas',
    'Sopas'
  ]
}
```

### 2. Agregar Productos

**Opción A: Manualmente en MongoDB**
```javascript
db.productos.insertOne({
  nombre: "Producto Nuevo",
  descripcion: "Descripción del producto",
  precio: 5.99,
  imagenUrl: "https://url-de-imagen.com/imagen.jpg",
  categoria: "Categoría",
  disponible: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Opción B: Desde el código**

Editar `backend/scripts/seedData.js` y agregar productos al array.

**Opción C: API (recomendado para producción)**
```bash
curl -X POST http://localhost:5000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Producto Nuevo",
    "descripcion": "Descripción",
    "precio": 5.99,
    "categoria": "Snacks",
    "imagenUrl": "https://url.com/imagen.jpg"
  }'
```

### 3. Imágenes de Productos

**Opciones:**
- Usar URLs de servicios como Unsplash, Pexels
- Subir a Cloudinary o AWS S3
- Servir desde el servidor (crear carpeta `backend/public/images`)

## 💳 Métodos de Pago

### 1. Configurar Datos de Pago

**Backend - `.env`:**
```env
# Pago Móvil
PAGO_MOVIL_CI=V12345678
PAGO_MOVIL_TELEFONO=04141234567
PAGO_MOVIL_BANCO=Banco de Venezuela

# Transferencia
TRANSFERENCIA_BANCO=Banco de Venezuela
TRANSFERENCIA_CUENTA=01020123456789012345
TRANSFERENCIA_TITULAR=Tu Negocio C.A.
TRANSFERENCIA_RIF=J123456789

# Zelle
ZELLE_EMAIL=pagos@tunegocio.com

# PayPal
PAYPAL_EMAIL=pagos@tunegocio.com
```

### 2. Agregar Nuevos Métodos

**Backend - `models/Pedido.js`:**
```javascript
metodoPago: {
  type: String,
  enum: [
    'pago_movil',
    'transferencia',
    'efectivo',
    'zelle',
    'paypal',
    'punto_venta',
    'binance',  // Nuevo método
    'pendiente'
  ],
  default: 'pendiente'
}
```

**Frontend - `src/components/cliente/Pago.js`:**

Agregar nuevo botón de método de pago siguiendo el patrón existente.

## 🏠 Mesas

### 1. Cantidad de Mesas

**Backend - `scripts/seedData.js`:**
```javascript
const mesasEjemplo = [
  { numeroMesa: 1, estado: 'libre' },
  { numeroMesa: 2, estado: 'libre' },
  // ... agregar más mesas
  { numeroMesa: 20, estado: 'libre' }
];
```

### 2. Generar Códigos QR

```bash
cd backend
npm run qr 20  # Para 20 mesas
```

## 🎯 Funcionalidades Adicionales

### 1. Agregar Campo de Alergias

**Backend - `models/Pedido.js`:**
```javascript
alergias: {
  type: String,
  trim: true
}
```

**Frontend - `src/components/cliente/Carrito.js`:**

Agregar campo de input para alergias.

### 2. Sistema de Descuentos

**Backend - `models/Producto.js`:**
```javascript
descuento: {
  type: Number,
  default: 0,
  min: 0,
  max: 100
},
precioConDescuento: {
  type: Number
}
```

### 3. Horarios de Disponibilidad

**Backend - `models/Producto.js`:**
```javascript
horarioDisponible: {
  inicio: String,  // "08:00"
  fin: String      // "22:00"
}
```

### 4. Productos Destacados

**Backend - `models/Producto.js`:**
```javascript
destacado: {
  type: Boolean,
  default: false
}
```

## 📱 Personalización de PWA

### 1. Iconos y Splash Screens

**Frontend - `public/manifest.json`:**
```json
{
  "short_name": "Tu Café",
  "name": "Tu Café - Menú Digital",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#22c55e",
  "background_color": "#ffffff"
}
```

### 2. Generar Iconos

Usa herramientas como:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/

## 🔔 Notificaciones

### 1. Sonido de Notificación

**Frontend - `src/components/admin/Dashboard.js`:**

Personalizar la función `reproducirSonido()` con tu propio audio:

```javascript
const reproducirSonido = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
};
```

### 2. Notificaciones Push

Implementar usando Firebase Cloud Messaging (FCM):

```bash
npm install firebase
```

## 📊 Reportes Personalizados

### 1. Agregar Endpoint de Reportes

**Backend - `controllers/reportesController.js`:**
```javascript
exports.obtenerReporteDiario = async (req, res) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const pedidos = await Pedido.find({
    createdAt: { $gte: hoy },
    pagado: true
  });
  
  // Calcular estadísticas
  const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
  const totalPropinas = pedidos.reduce((sum, p) => sum + p.propina, 0);
  
  res.json({
    success: true,
    data: {
      fecha: hoy,
      cantidadPedidos: pedidos.length,
      totalVentas,
      totalPropinas,
      totalGeneral: totalVentas + totalPropinas
    }
  });
};
```

## 🌐 Idiomas

### 1. Implementar i18n

```bash
cd frontend
npm install react-i18next i18next
```

Crear archivos de traducción en `frontend/src/locales/`.

## 🎨 Temas (Modo Oscuro)

**Frontend - Agregar contexto de tema:**

```javascript
// src/context/ThemeContext.js
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className={darkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

**Tailwind - `tailwind.config.js`:**
```javascript
module.exports = {
  darkMode: 'class',
  // ...
}
```

## 📸 Galería de Fotos

Agregar galería de fotos del local:

**Frontend - Crear componente `Galeria.js`:**
```javascript
const Galeria = () => {
  const fotos = [
    '/images/local1.jpg',
    '/images/local2.jpg',
    // ...
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {fotos.map((foto, i) => (
        <img key={i} src={foto} alt={`Foto ${i+1}`} />
      ))}
    </div>
  );
};
```

## 🎁 Programa de Lealtad

**Backend - Crear modelo `Cliente.js`:**
```javascript
const clienteSchema = new mongoose.Schema({
  telefono: String,
  nombre: String,
  puntos: { type: Number, default: 0 },
  pedidosRealizados: { type: Number, default: 0 }
});
```

## 🔧 Variables de Configuración

Crear archivo de configuración centralizado:

**Backend - `config/settings.js`:**
```javascript
module.exports = {
  negocio: {
    nombre: 'Tu Negocio',
    telefono: '0414-1234567',
    direccion: 'Yaracuy, Venezuela',
    instagram: '@sierrayaracafe'
  },
  sistema: {
    propinaPorDefecto: 10,
    tiempoMaximoPedido: 60, // minutos
    mesasMaximas: 20
  }
};
```

## 📝 Textos y Mensajes

Centralizar mensajes en archivo de constantes:

**Frontend - `src/constants/messages.js`:**
```javascript
export const MESSAGES = {
  BIENVENIDA: 'Bienvenido a Tu Negocio',
  CARRITO_VACIO: 'Tu carrito está vacío',
  PEDIDO_CONFIRMADO: '¡Pedido confirmado!',
  // ...
};
```

---

**¡Personaliza Sierra Yara a tu gusto!** 🎨
