# 📱 Cómo Acceder desde el Celular

## Problema Solucionado ✅

El código ahora detecta automáticamente si estás accediendo desde un celular en la misma red WiFi y se conecta correctamente al servidor.

## Pasos para Usar desde el Celular

### 1. Asegúrate de que el Backend esté Corriendo

En tu computadora, ejecuta:

```bash
cd backend
npm start
```

Deberías ver un mensaje como:
```
╔═══════════════════════════════════════════════╗
║   🏔️  Sierra Yara Café - Sistema de Menú    ║
║   🚀 Servidor corriendo en puerto 5000      ║
║   📡 WebSocket habilitado                     ║
║   🌐 Acceso local: http://192.168.1.105:5000  ║
╚═══════════════════════════════════════════════╝
```

**IMPORTANTE:** Anota la IP que aparece en el mensaje (ejemplo: `192.168.1.105`)

### 2. Asegúrate de que el Frontend esté Corriendo

En tu computadora, ejecuta:

```bash
cd frontend
npm start
```

El frontend se abrirá en `http://localhost:3000`

### 3. Encuentra la IP de tu Computadora

#### En Windows:
```bash
ipconfig
```

Busca la línea que dice "Dirección IPv4" en la sección de tu adaptador WiFi.
Ejemplo: `192.168.1.105`

#### En Mac/Linux:
```bash
ifconfig
```

Busca tu adaptador WiFi (usualmente `en0` o `wlan0`) y anota la dirección IP.

### 4. Accede desde tu Celular

1. **Asegúrate de que tu celular esté conectado a la misma red WiFi que tu computadora**
2. Abre el navegador en tu celular (Chrome, Safari, etc.)
3. Escribe la dirección: `http://TU_IP:3000`
   - Ejemplo: `http://192.168.1.105:3000`
4. Deberías ver la pantalla de bienvenida de Sierra Yara

### 5. Prueba la Conexión

1. Ingresa un número de mesa (ejemplo: 4)
2. Opcionalmente ingresa tu nombre
3. Presiona "Acceder al Menú"

Si todo está bien, deberías entrar al menú sin el error "Error al conectar a la mesa".

## ¿Qué se Cambió en el Código?

### Antes ❌
El archivo `api.js` estaba forzando el uso de `localhost`:

```javascript
const getApiUrl = () => {
  return 'http://localhost:5000/api';  // ❌ Solo funciona en la misma PC
};
```

### Después ✅
Ahora detecta automáticamente la IP:

```javascript
const getApiUrl = () => {
  // Detectar si estamos accediendo desde la red local
  const hostname = window.location.hostname;
  
  // Si el hostname es una IP local (no localhost), usar esa IP para el backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000/api`;  // ✅ Usa la IP de red local
  }
  
  return 'http://localhost:5000/api';  // Para desarrollo local
};
```

## Solución de Problemas

### 🔧 Script de Diagnóstico Automático

Ejecuta este script en PowerShell para verificar todo automáticamente:

```powershell
cd c:\Users\altov\Downloads\sierra_yara
.\verificar-conexion.ps1
```

Este script verificará:
- ✅ IP de tu PC
- ✅ Si el backend está corriendo
- ✅ Si el frontend está corriendo
- ✅ Reglas de firewall
- ✅ Conexión al backend

### Error: "Se queda en Conectando..."

**Causas comunes:**
1. El backend no está corriendo
2. El firewall está bloqueando el puerto 5000
3. Los dispositivos están en diferentes redes WiFi

**Solución:**
1. Ejecuta el script de diagnóstico (arriba)
2. Lee el archivo `DIAGNOSTICO.md` para pasos detallados
3. Verifica que veas este mensaje en la terminal del backend:
   ```
   🚀 Servidor corriendo en puerto 5000
   ```

### Error: "No se puede conectar al servidor"

1. **Verifica que ambos dispositivos estén en la misma red WiFi**
2. **Verifica que el backend esté corriendo** (debe mostrar el mensaje de inicio)
3. **Verifica que el firewall no esté bloqueando el puerto 5000**
   - En Windows: Ve a "Firewall de Windows Defender" → "Configuración avanzada" → "Reglas de entrada"
   - Crea una regla para permitir el puerto 5000

### Error: "Tiempo de espera agotado"

1. **El backend probablemente no está corriendo**
2. **O el firewall está bloqueando la conexión**
3. Ejecuta el script de diagnóstico para verificar

### Error: "Mesa no encontrada"

1. **Verifica que la mesa exista en la base de datos**
2. **Crea la mesa desde el panel de administración**
3. **Revisa la consola del backend** para ver si hay errores

### El frontend no carga en el celular

1. **Verifica la IP de tu computadora** con `ipconfig` o `ifconfig`
2. **Asegúrate de incluir el puerto** `:3000` en la URL
3. **Prueba hacer ping** desde tu celular a la IP de tu computadora
4. **Ejecuta el script de diagnóstico** para verificar todo

## Notas Adicionales

- **Seguridad:** Esta configuración es solo para desarrollo local. Para producción, deberías usar HTTPS y configurar CORS apropiadamente.
- **Rendimiento:** La conexión por WiFi local es muy rápida y no consume datos móviles.
- **Debugging:** Puedes abrir la consola del navegador en el celular para ver los logs de conexión.

## Comandos Útiles

### Reiniciar el Backend
```bash
cd backend
npm start
```

### Reiniciar el Frontend
```bash
cd frontend
npm start
```

### Ver la IP de tu PC (Windows)
```bash
ipconfig | findstr IPv4
```

### Ver la IP de tu PC (Mac/Linux)
```bash
ifconfig | grep "inet "
```

## Contacto

Si sigues teniendo problemas, revisa:
1. Los logs del backend en la terminal
2. La consola del navegador (F12 → Console)
3. Que ambos dispositivos estén en la misma red WiFi
