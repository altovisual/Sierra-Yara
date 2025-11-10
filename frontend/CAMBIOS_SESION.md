# Mejoras en la Persistencia de Datos y Gestión de Sesiones

## 🎯 Problema Resuelto

Cuando un usuario escaneaba un QR de una mesa diferente desde el mismo dispositivo, el sistema mantenía los datos de la sesión anterior indefinidamente, causando confusión.

## ✨ Soluciones Implementadas

### 1. **Expiración Automática de Sesiones**
- Las sesiones ahora expiran automáticamente después de **2 horas** (configurable)
- Se muestra en consola el tiempo restante al restaurar una sesión
- Las sesiones expiradas se limpian automáticamente

### 2. **Detección Inteligente de Cambio de Mesa**
- El sistema detecta cuando se escanea un QR de una mesa diferente
- Limpia automáticamente los datos de la sesión anterior
- Si se escanea el mismo QR, redirige directamente al menú

### 3. **Limpieza Selectiva de Datos**
- **Carrito**: Se limpia automáticamente al cambiar de mesa (configurable)
- **Favoritos**: Se mantienen entre sesiones por defecto (configurable)
- **Sesión de mesa**: Siempre se limpia al desconectar

## ⚙️ Configuración

Puedes ajustar el comportamiento editando el archivo:
```
frontend/src/config/sesion.js
```

### Opciones disponibles:

```javascript
// Tiempo de expiración (en milisegundos)
export const TIEMPO_EXPIRACION_SESION = 2 * 60 * 60 * 1000; // 2 horas

// Ejemplos de otros tiempos:
// 30 minutos: 30 * 60 * 1000
// 1 hora: 60 * 60 * 1000
// 4 horas: 4 * 60 * 60 * 1000

// Limpiar carrito al cambiar de mesa
export const LIMPIAR_CARRITO_AL_CAMBIAR_MESA = true;

// Limpiar favoritos al cambiar de mesa
export const LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA = false;
```

## 🔄 Flujo de Trabajo

### Escenario 1: Primera vez escaneando un QR
1. Usuario escanea QR de Mesa 5
2. Ingresa su nombre
3. Se guarda la sesión con timestamp
4. Accede al menú

### Escenario 2: Escaneando el mismo QR (sesión activa)
1. Usuario escanea QR de Mesa 5 nuevamente
2. Sistema detecta que ya está conectado a esa mesa
3. Redirige directamente al menú (sin pedir nombre)

### Escenario 3: Escaneando un QR diferente
1. Usuario escanea QR de Mesa 8 (estaba en Mesa 5)
2. Sistema detecta el cambio de mesa
3. Limpia automáticamente:
   - Sesión anterior
   - Carrito (si está configurado)
   - Favoritos (si está configurado)
4. Muestra formulario para ingresar nombre
5. Crea nueva sesión para Mesa 8

### Escenario 4: Sesión expirada
1. Usuario regresa después de 2+ horas
2. Sistema detecta que la sesión expiró
3. Limpia datos automáticamente
4. Muestra pantalla de escaneo QR

## 📊 Logs en Consola

El sistema ahora muestra información útil en la consola del navegador:

```
📦 Datos guardados en localStorage: {...}
✅ Restaurando sesión de mesa: 5
⏱️ Tiempo restante: 118 minutos

🔄 Cambiando de mesa 5 → 8
🧹 Limpiando sesión anterior...
🛒 Carrito limpiado
✅ Sesión limpiada completamente

⏰ Sesión expirada. Limpiando datos...
```

## 🧪 Pruebas Recomendadas

1. **Prueba de expiración**: Cambiar `TIEMPO_EXPIRACION_SESION` a 1 minuto para probar
2. **Prueba de cambio de mesa**: Escanear diferentes QRs consecutivamente
3. **Prueba de mismo QR**: Escanear el mismo QR múltiples veces
4. **Prueba de carrito**: Verificar que el carrito se limpia/mantiene según configuración

## 🔧 Archivos Modificados

- `frontend/src/context/MesaContext.js` - Lógica de sesión y expiración
- `frontend/src/components/cliente/EscanearQR.js` - Detección de cambio de mesa
- `frontend/src/config/sesion.js` - Configuración centralizada (NUEVO)

## 💡 Recomendaciones

- Para **restaurantes con alta rotación**: Reducir tiempo de expiración a 1 hora
- Para **cafeterías con estadías largas**: Mantener 2-4 horas
- Para **pruebas en desarrollo**: Usar tiempos cortos (5-10 minutos)
- Mantener `LIMPIAR_CARRITO_AL_CAMBIAR_MESA = true` para evitar confusiones
- Mantener `LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA = false` para mejor UX

## 🐛 Solución de Problemas

**Problema**: Los datos no se limpian al cambiar de mesa
- Verificar que `LIMPIAR_CARRITO_AL_CAMBIAR_MESA = true` en `config/sesion.js`
- Revisar la consola del navegador para ver los logs

**Problema**: La sesión expira muy rápido
- Aumentar `TIEMPO_EXPIRACION_SESION` en `config/sesion.js`

**Problema**: Los favoritos se borran al cambiar de mesa
- Cambiar `LIMPIAR_FAVORITOS_AL_CAMBIAR_MESA = false` en `config/sesion.js`
