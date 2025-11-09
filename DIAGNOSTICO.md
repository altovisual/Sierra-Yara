# 🔍 Diagnóstico: "Se queda conectando"

## Problema

El botón muestra "Conectando..." pero nunca responde. Esto indica que:
1. El frontend no puede alcanzar el backend
2. El backend no está corriendo
3. Hay un problema de red/firewall

## ✅ Pasos para Diagnosticar

### 1. Verifica que el Backend esté Corriendo

Abre una terminal en tu computadora y ejecuta:

```bash
cd c:\Users\altov\Downloads\sierra_yara\backend
npm start
```

**Deberías ver:**
```
╔═══════════════════════════════════════════════╗
║   🏔️  Sierra Yara Café - Sistema de Menú    ║
║   🚀 Servidor corriendo en puerto 5000      ║
║   📡 WebSocket habilitado                     ║
║   🌐 Acceso local: http://192.168.1.105:5000  ║
╚═══════════════════════════════════════════════╝
```

**Si ves errores:**
- Error de MongoDB: Verifica tu conexión a internet (estás usando MongoDB Atlas)
- Error de puerto ocupado: Cierra otras instancias del servidor

### 2. Verifica la IP de tu Computadora

En Windows PowerShell:
```powershell
ipconfig | Select-String "IPv4"
```

**Anota tu IP**, ejemplo: `192.168.1.103`

### 3. Verifica que el Frontend esté Corriendo

```bash
cd c:\Users\altov\Downloads\sierra_yara\frontend
npm start
```

### 4. Prueba la Conexión al Backend desde tu PC

Abre el navegador en tu PC y ve a:
```
http://localhost:5000/api/health
```

**Deberías ver:**
```json
{
  "success": true,
  "message": "Sierra Yara API funcionando correctamente",
  "timestamp": "2024-11-09T12:20:00.000Z"
}
```

### 5. Prueba la Conexión desde tu Celular

**IMPORTANTE:** Asegúrate de que tu celular esté en la misma WiFi que tu PC.

En el navegador del celular, ve a:
```
http://TU_IP:5000/api/health
```

Ejemplo: `http://192.168.1.103:5000/api/health`

**Si funciona:** Verás el mismo JSON de arriba
**Si NO funciona:** Sigue al paso 6

### 6. Verifica el Firewall de Windows

El firewall puede estar bloqueando el puerto 5000.

#### Opción A: Desactivar temporalmente (para pruebas)
1. Ve a "Configuración de Windows"
2. Busca "Firewall de Windows Defender"
3. Desactívalo temporalmente
4. Prueba de nuevo desde el celular

#### Opción B: Crear regla (recomendado)
1. Abre "Firewall de Windows Defender con seguridad avanzada"
2. Click en "Reglas de entrada"
3. Click en "Nueva regla..."
4. Selecciona "Puerto" → Siguiente
5. Selecciona "TCP" y escribe "5000" → Siguiente
6. Selecciona "Permitir la conexión" → Siguiente
7. Marca todas las opciones → Siguiente
8. Nombre: "Sierra Yara Backend" → Finalizar

### 7. Verifica la Consola del Navegador

En tu celular:
1. Abre el navegador
2. Ve a `http://TU_IP:3000`
3. Abre las herramientas de desarrollo (si tu navegador lo permite)
4. Busca en la consola el mensaje: `🔧 API_URL configurada:`

**Debería mostrar:** `http://192.168.1.103:5000/api` (con tu IP)

## 🐛 Errores Comunes y Soluciones

### Error: "Tiempo de espera agotado"
- **Causa:** El backend no está corriendo o el firewall está bloqueando
- **Solución:** Verifica pasos 1 y 6

### Error: "No se puede conectar al servidor"
- **Causa:** Dispositivos en diferentes redes WiFi o backend apagado
- **Solución:** 
  - Verifica que ambos estén en la misma WiFi
  - Reinicia el backend
  - Verifica la IP con `ipconfig`

### Error: "Mesa no encontrada"
- **Causa:** La mesa no existe en la base de datos
- **Solución:** Crea la mesa desde el panel de administración

### El botón se queda en "Conectando..."
- **Causa:** No hay timeout configurado (YA SOLUCIONADO)
- **Solución:** Los cambios que hice agregan un timeout de 10 segundos

## 📝 Checklist Rápido

Marca cada punto que hayas verificado:

- [ ] Backend corriendo (`npm start` en backend)
- [ ] Frontend corriendo (`npm start` en frontend)
- [ ] Ambos dispositivos en la misma WiFi
- [ ] IP de la PC verificada con `ipconfig`
- [ ] URL del celular: `http://TU_IP:3000`
- [ ] Endpoint de salud funciona: `http://TU_IP:5000/api/health`
- [ ] Firewall permite conexiones al puerto 5000
- [ ] MongoDB conectado (si usas Atlas, verifica internet)

## 🔧 Comandos Útiles

### Ver IP de tu PC
```powershell
ipconfig | Select-String "IPv4"
```

### Verificar si el puerto 5000 está en uso
```powershell
netstat -ano | findstr :5000
```

### Matar proceso en puerto 5000 (si está ocupado)
```powershell
# Primero encuentra el PID con el comando anterior
# Luego:
taskkill /PID <numero_pid> /F
```

### Reiniciar todo
```bash
# Terminal 1 - Backend
cd c:\Users\altov\Downloads\sierra_yara\backend
npm start

# Terminal 2 - Frontend
cd c:\Users\altov\Downloads\sierra_yara\frontend
npm start
```

## 📱 Prueba Final

1. Backend corriendo ✅
2. Frontend corriendo ✅
3. Desde tu PC, abre: `http://localhost:3000` → Debería funcionar
4. Desde tu celular, abre: `http://TU_IP:3000` → Debería funcionar
5. Ingresa número de mesa → Debería conectar

## 🆘 Si Nada Funciona

1. **Reinicia tu router WiFi**
2. **Reinicia tu PC**
3. **Verifica que no tengas VPN activa**
4. **Prueba con otro celular**
5. **Revisa los logs del backend** en la terminal donde lo ejecutaste

## 📞 Información de Debug

Cuando pidas ayuda, proporciona:
1. El mensaje que aparece en la terminal del backend
2. El mensaje de error en el celular
3. Tu IP (de `ipconfig`)
4. La URL que estás usando en el celular
5. Captura de pantalla de la consola del navegador (F12)
