# 🚀 Guía de Despliegue en Render - Sistema Tasa BCV

## 📋 Checklist de Despliegue

### ✅ Paso 1: Verificar Configuración de Render

1. **Ve a tu servicio en Render:**
   - https://dashboard.render.com/

2. **Verifica las variables de entorno:**
   ```
   MONGODB_URI=mongodb+srv://...
   CORS_ORIGIN=https://sierra-yara.vercel.app
   PORT=5000
   ```

3. **NO necesitas agregar nada nuevo** - Las dependencias se instalarán automáticamente

---

### ✅ Paso 2: Desplegar Cambios

#### Opción A: Desde GitHub (Automático)
```bash
git push origin main
```
✅ Render detectará los cambios y desplegará automáticamente

#### Opción B: Desde Render Dashboard (Manual)
1. Ve a tu servicio
2. Click en "Manual Deploy"
3. Selecciona "Deploy latest commit"

---

### ✅ Paso 3: Verificar Instalación

#### 1. Ver Logs de Despliegue
En Render Dashboard → Logs, deberías ver:

```
==> Installing dependencies...
npm install
✅ axios@1.6.2
✅ node-cron@3.0.3

==> Starting service...
⏰ Cron job configurado: Actualización de tasa BCV cada 6 horas
🔄 Actualizando tasa BCV automáticamente...
✅ Tasa BCV actualizada: 36.50

╔═══════════════════════════════════════════════╗
║   🏔️  Sierra Yara Café - Sistema de Menú    ║
║   🚀 Servidor corriendo en puerto 5000       ║
║   📡 WebSocket habilitado                     ║
║   💱 Actualización automática de tasa BCV     ║
╚═══════════════════════════════════════════════╝
```

#### 2. Probar API de Tasa
Abre en el navegador o usa curl:

```bash
# Obtener tasa actual
curl https://sierra-yara.onrender.com/api/tasa-bcv/actual

# Respuesta esperada:
{
  "success": true,
  "data": {
    "valor": 36.50,
    "fuente": "api",
    "actualizadoPor": "sistema",
    "activa": true,
    "createdAt": "2025-11-09T..."
  }
}
```

#### 3. Verificar Actualización Automática
En los logs, cada 6 horas deberías ver:

```
🔄 Actualizando tasa BCV automáticamente...
✅ Tasa BCV actualizada: 36.50
```

---

### ✅ Paso 4: Verificar en Producción

#### Test 1: API Funciona
```bash
curl https://sierra-yara.onrender.com/api/tasa-bcv/actual
```
✅ Debe devolver la tasa actual

#### Test 2: Histórico
```bash
curl https://sierra-yara.onrender.com/api/tasa-bcv/historico
```
✅ Debe devolver array de tasas

#### Test 3: Estadísticas
```bash
curl https://sierra-yara.onrender.com/api/tasa-bcv/estadisticas
```
✅ Debe devolver promedio, mín, máx

---

## 🔧 Solución de Problemas

### Problema 1: "No hay tasa configurada"

**Síntoma:**
```json
{
  "success": false,
  "error": "No hay tasa configurada"
}
```

**Solución:**
Ejecutar manualmente el script de inicialización:

1. Ve a Render Dashboard → Shell
2. Ejecuta:
```bash
npm run init-tasa
```

O usa el endpoint de actualización:
```bash
curl -X POST https://sierra-yara.onrender.com/api/tasa-bcv/actualizar-api
```

---

### Problema 2: Error al instalar dependencias

**Síntoma:**
```
npm ERR! code ENOTFOUND
npm ERR! network request to https://registry.npmjs.org/axios failed
```

**Solución:**
1. Ve a Render Dashboard
2. Settings → Build & Deploy
3. Click "Clear build cache"
4. Redeploy

---

### Problema 3: Cron job no se ejecuta

**Síntoma:**
No ves logs de actualización cada 6 horas

**Solución:**
Verificar que el servidor esté corriendo 24/7:
1. Render Dashboard → Settings
2. Verifica que el plan sea "Starter" o superior (no Free)
3. Free tier se suspende después de 15 min de inactividad

**Alternativa:**
Configurar un servicio externo como cron-job.org para llamar al endpoint cada 6 horas:
```
URL: https://sierra-yara.onrender.com/api/tasa-bcv/actualizar-api
Method: POST
Schedule: 0 6,12,18,0 * * *
```

---

### Problema 4: API externa no responde

**Síntoma:**
```
❌ Error al actualizar tasa BCV: timeout of 10000ms exceeded
```

**Solución:**
El sistema tiene fallback automático:
1. Intenta PyDolarVe
2. Si falla, intenta ExchangeRate-API
3. Si ambos fallan, usa la última tasa guardada

Para forzar actualización manual:
```bash
curl -X POST https://sierra-yara.onrender.com/api/tasa-bcv/actualizar \
  -H "Content-Type: application/json" \
  -d '{"valor": 36.50, "actualizadoPor": "Admin"}'
```

---

## 📊 Monitoreo

### Logs Importantes a Vigilar:

```bash
# Inicio del servidor
✅ Tasa BCV actualizada: 36.50

# Cada 6 horas
🔄 Actualizando tasa BCV automáticamente...
✅ Tasa BCV actualizada: 36.75

# Si hay error
❌ Error al actualizar tasa BCV: [mensaje]
```

### Comandos Útiles:

```bash
# Ver últimos logs
render logs --tail

# Ver logs en tiempo real
render logs --follow

# Ejecutar comando en el servidor
render shell
```

---

## 🎯 Checklist Final

Antes de dar por completado el despliegue, verifica:

- [ ] ✅ Servidor desplegado sin errores
- [ ] ✅ Dependencias instaladas (axios, node-cron)
- [ ] ✅ Tasa BCV inicializada
- [ ] ✅ API `/api/tasa-bcv/actual` responde
- [ ] ✅ Cron job configurado
- [ ] ✅ Logs muestran actualización exitosa
- [ ] ✅ Frontend puede obtener la tasa

---

## 📝 Próximos Pasos

Una vez verificado que todo funciona:

1. **Integrar en el Frontend:**
   - Mostrar precios en USD y Bs
   - Agregar indicador de tasa actual
   - Panel admin para gestionar tasa

2. **Monitoreo:**
   - Configurar alertas si la tasa no se actualiza
   - Dashboard de estadísticas

3. **Optimizaciones:**
   - Caché de tasa en frontend
   - Notificaciones de cambios significativos

---

## 🆘 Soporte

Si algo no funciona:

1. **Revisar logs en Render**
2. **Verificar variables de entorno**
3. **Probar endpoints manualmente**
4. **Ejecutar `npm run init-tasa` si es necesario**

---

## ✅ Estado del Despliegue

Después de seguir esta guía, deberías tener:

✅ Backend con sistema de tasa BCV funcional  
✅ Actualización automática cada 6 horas  
✅ API endpoints disponibles  
✅ Logs de monitoreo  
✅ Sistema robusto con fallbacks  

**¡Listo para producción!** 🎉
