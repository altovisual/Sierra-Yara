# 🔐 Credenciales de Administrador

## Credenciales de Prueba

Para acceder al panel de administración, utiliza las siguientes credenciales:

```
📧 Email:    admin@sierrayara.com
🔑 Password: admin123
```

## 🚀 Cómo Inicializar el Administrador

### Opción 1: Ejecutar el script (Recomendado)

```bash
cd backend
npm run init-admin
```

Este script:
- ✅ Crea el administrador si no existe
- ✅ Actualiza la contraseña si ya existe
- ✅ Muestra las credenciales en consola

### Opción 2: Manualmente con curl

```bash
curl -X POST https://sierra-yara.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "email": "admin@sierrayara.com",
    "password": "admin123",
    "rol": "superadmin"
  }'
```

## 🌐 URLs de Acceso

- **Producción:** https://sierra-yara.onrender.com/admin/login
- **Local:** http://localhost:3000/admin/login

## ⚠️ Seguridad

### Para Producción:

1. **Cambia la contraseña** después del primer login
2. Usa el endpoint `PUT /api/auth/cambiar-password`
3. **No compartas** estas credenciales
4. Considera deshabilitar el registro público después del setup inicial

### Cambiar Contraseña:

```bash
curl -X PUT https://sierra-yara.onrender.com/api/auth/cambiar-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "passwordActual": "admin123",
    "passwordNuevo": "tu_nueva_contraseña_segura"
  }'
```

## 📋 Características del Admin

- **Rol:** Superadmin
- **Permisos:** Acceso completo a todas las funciones
- **Sesión:** Token JWT sin expiración (sesión persistente)
- **Seguridad:** Password encriptado con bcrypt
- **Keep-alive:** Backend siempre activo en Render (ping cada 10 min)

### Funcionalidades Disponibles:

#### 📊 Dashboard
- Estadísticas en tiempo real
- Mapa de mesas activas
- Pedidos del día
- Gráficos de ventas

#### 🛒 Gestión de Pedidos
- Vista completa de todos los pedidos
- Cambio de estado en tiempo real
- Confirmación de pagos
- Cancelación de pedidos
- Notificaciones con sonido

#### 🍽️ Gestión de Productos
- CRUD completo
- Categorías
- Control de disponibilidad
- Precios en USD
- Imágenes de productos

#### 🎁 Gestión de Promociones
- Creación de promociones
- Programación por horarios y días
- Descuentos por porcentaje o monto fijo
- Activación/desactivación instantánea
- Asignación a productos específicos

#### 📦 Control de Inventario
- Stock en tiempo real
- Alertas de stock bajo
- Actualización manual
- Historial de movimientos

#### 💱 Gestión de Tasa BCV
- Actualización automática cada 6 horas
- Actualización manual
- Histórico de cambios
- Estadísticas de variación

#### 👥 Gestión de Clientes
- Base de datos completa
- Segmentación automática (Nuevo, Regular, Frecuente, VIP, Inactivo)
- Estadísticas por cliente
- Productos preferidos
- Exportación para marketing
- Reportes PDF

#### 📈 Reportes
- Reportes Excel (ventas, productos, clientes)
- Reportes PDF profesionales
- Estado de cuenta detallado
- Gráficos y tablas visuales
- Descarga directa

#### 🏷️ Generador de QR
- Códigos QR únicos por mesa
- Personalización de diseño
- Descarga en alta resolución
- Listo para imprimir

#### 📱 Panel 100% Responsive
- Vista adaptativa (cards en móvil, tablas en desktop)
- Inputs táctiles (44px, fuente 16px)
- Botones grandes (40-44px)
- Switches mejorados
- Animaciones suaves

## 🎨 Diseño del Login

El login ahora tiene:
- ✅ Colores de la marca Sierra Yara (verde oscuro/teal)
- ✅ Gradiente de fondo con los colores corporativos
- ✅ Logo en círculo con sombra
- ✅ Diseño moderno y profesional
- ✅ Responsive para móviles

## 🔄 Recuperar Acceso

Si olvidas la contraseña:
1. Ejecuta `npm run init-admin` en el backend
2. Esto restablecerá la contraseña a `admin123`
3. Inicia sesión y cámbiala inmediatamente

---

**Nota:** Estas son credenciales de prueba. En producción, asegúrate de usar contraseñas fuertes y únicas.
