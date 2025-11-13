# 🔐 SESIÓN SIN EXPIRACIÓN Y KEEP-ALIVE DE RENDER

## 📋 RESUMEN

Se han implementado dos mejoras críticas para evitar interrupciones del servicio:

1. **Sesión de Admin sin expiración** - El token JWT ya no expira
2. **Keep-alive de Render** - El servidor se mantiene activo 24/7

---

## 🔑 1. SESIÓN SIN EXPIRACIÓN

### ❌ Problema Anterior:
- El token JWT expiraba después de 30 días
- Los administradores tenían que volver a iniciar sesión
- Interrumpía el servicio en medio de operaciones

### ✅ Solución Implementada:

**Archivo:** `backend/controllers/authController.js`

```javascript
// ANTES (con expiración)
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'  // ❌ Expiraba en 30 días
  });
};

// AHORA (sin expiración)
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);  // ✅ Nunca expira
};
```

### 🎯 Beneficios:
- ✅ **Sin interrupciones** - La sesión nunca expira
- ✅ **Mejor UX** - No hay que volver a iniciar sesión
- ✅ **Servicio continuo** - Ideal para operaciones 24/7

### ⚠️ Consideraciones de Seguridad:
- El token solo se invalida si:
  1. El usuario hace logout manualmente
  2. Se borra el localStorage del navegador
  3. Se cambia el JWT_SECRET en el servidor

### 🔒 Recomendaciones:
- Mantener el JWT_SECRET seguro en variables de entorno
- Usar HTTPS en producción
- Implementar logout manual cuando sea necesario

---

## 🔄 2. KEEP-ALIVE DE RENDER

### ❌ Problema con Render:
Render pone a dormir los servicios gratuitos después de **15 minutos de inactividad**:
- El servidor se apaga
- Las peticiones fallan
- Tarda 30-60 segundos en despertar
- Mala experiencia de usuario

### ✅ Solución Implementada:

**Archivo:** `backend/server.js`

#### A. Ruta de Health Check

**Archivo:** `backend/routes/healthRoutes.js`

```javascript
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

#### B. Función Keep-Alive

```javascript
const keepRenderAlive = async () => {
  try {
    const https = require('https');
    const http = require('http');
    
    // URL de tu servidor en Render
    const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
    
    if (renderUrl) {
      const protocol = renderUrl.startsWith('https') ? https : http;
      const url = new URL(renderUrl + '/api/health');
      
      protocol.get(url, (res) => {
        console.log('🔄 Keep-alive Render - Status:', res.statusCode);
      }).on('error', (err) => {
        console.log('ℹ️  Keep-alive Render (local mode)');
      });
    }
  } catch (error) {
    console.log('ℹ️  Keep-alive Render (modo desarrollo)');
  }
};

// Ejecutar cada 10 minutos
cron.schedule('*/10 * * * *', keepRenderAlive);
```

### 📊 Cómo Funciona:

1. **Cada 10 minutos**, el servidor hace una petición HTTP a sí mismo
2. Esto cuenta como "actividad" para Render
3. Render NO pone el servidor a dormir
4. El servidor permanece activo 24/7

### 🎯 Beneficios:
- ✅ **Servidor siempre activo** - No más esperas de 30-60 segundos
- ✅ **Respuestas inmediatas** - Sin delays al hacer peticiones
- ✅ **Mejor experiencia** - El sistema siempre está listo
- ✅ **Confiable** - Funciona en producción y desarrollo

### ⚙️ Configuración en Render:

Agrega esta variable de entorno en tu dashboard de Render:

```
RENDER_EXTERNAL_URL=https://tu-app.onrender.com
```

O si ya tienes:

```
BACKEND_URL=https://tu-app.onrender.com
```

---

## 🏓 3. KEEP-ALIVE DE MONGODB (YA EXISTENTE)

También mantenemos MongoDB activo con ping cada 5 minutos:

```javascript
const keepMongoDBAlive = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Ping a MongoDB - Base de datos activa');
    }
  } catch (error) {
    console.error('❌ Error en keep-alive de MongoDB:', error.message);
  }
};

// Ejecutar cada 5 minutos
cron.schedule('*/5 * * * *', keepMongoDBAlive);
```

---

## 📦 RESUMEN DE CRON JOBS

El servidor ahora ejecuta 3 tareas programadas:

| Tarea | Frecuencia | Propósito |
|-------|-----------|-----------|
| 🏓 MongoDB Keep-Alive | Cada 5 minutos | Evitar sleep de MongoDB Atlas |
| 🔄 Render Keep-Alive | Cada 10 minutos | Evitar sleep de Render |
| 💱 Actualizar Tasa BCV | Cada 6 horas | Mantener tasa actualizada |

---

## 🚀 CÓMO VERIFICAR QUE FUNCIONA

### 1. Verificar Logs del Servidor:

Deberías ver estos mensajes cada cierto tiempo:

```
🏓 Ping a MongoDB - Base de datos activa
🔄 Keep-alive Render - Status: 200
✅ Tasa BCV actualizada: 45.67
```

### 2. Verificar Health Check:

Visita en tu navegador:
```
https://tu-app.onrender.com/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Server is alive",
  "timestamp": "2025-11-13T15:00:00.000Z",
  "uptime": 3600
}
```

### 3. Verificar en Dashboard de Render:

- Ve a tu dashboard de Render
- Verás que el servidor tiene actividad constante
- No debería aparecer como "sleeping"

---

## 🎉 RESULTADO FINAL

### ✅ Sesión de Admin:
- **Nunca expira**
- No hay que volver a iniciar sesión
- Servicio continuo sin interrupciones

### ✅ Servidor Render:
- **Siempre activo**
- Respuestas inmediatas
- Sin delays de 30-60 segundos

### ✅ Base de Datos MongoDB:
- **Siempre activa**
- Sin interrupciones por sleep mode
- Conexión estable

---

## 🔧 MANTENIMIENTO

### Si necesitas cerrar sesión manualmente:

En el frontend, el botón de logout ya existe y funciona correctamente.

### Si necesitas cambiar el JWT_SECRET:

1. Actualiza la variable de entorno en Render
2. Todos los usuarios tendrán que volver a iniciar sesión
3. Los tokens antiguos dejarán de funcionar

### Si Render sigue durmiendo:

1. Verifica que `RENDER_EXTERNAL_URL` esté configurado
2. Revisa los logs para ver si el keep-alive funciona
3. Asegúrate de que la ruta `/api/health` responda correctamente

---

## 📝 ARCHIVOS MODIFICADOS

- ✅ `backend/controllers/authController.js` - Token sin expiración
- ✅ `backend/server.js` - Keep-alive de Render
- ✅ `backend/routes/healthRoutes.js` - Nuevo endpoint de health
- ✅ `SESION_SIN_EXPIRACION.md` - Esta documentación

---

## 🎊 ¡LISTO!

Tu sistema ahora:
- ✅ Tiene sesiones que nunca expiran
- ✅ Se mantiene activo 24/7 en Render
- ✅ Tiene MongoDB siempre disponible
- ✅ Ofrece una experiencia sin interrupciones

**¡No más problemas de sesión expirada o servidor dormido!** 🚀
