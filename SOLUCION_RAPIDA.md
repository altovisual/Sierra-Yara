# 🚨 SOLUCIÓN RÁPIDA - No Conecta desde el Celular

## El Problema

El **Firewall de Windows está bloqueando el puerto 5000**, por eso no puedes conectarte desde el celular.

## ✅ Solución (Elige una)

### Opción 1: Abrir el Puerto en el Firewall (RECOMENDADO)

1. **Haz clic derecho en el ícono de PowerShell** en la barra de tareas
2. Selecciona **"Ejecutar como administrador"**
3. Navega a la carpeta:
   ```powershell
   cd c:\Users\altov\Downloads\sierra_yara
   ```
4. Ejecuta el script:
   ```powershell
   .\abrir-firewall.ps1
   ```
5. **¡Listo!** Ahora intenta conectar desde tu celular

### Opción 2: Desactivar el Firewall Temporalmente (MÁS RÁPIDO)

1. Presiona **Windows + I** (Configuración)
2. Busca **"Firewall"**
3. Click en **"Firewall de Windows Defender"**
4. Click en **"Activar o desactivar Firewall de Windows Defender"**
5. **Desactiva** las opciones de red privada
6. Click en **Aceptar**
7. **Intenta conectar desde tu celular**

⚠️ **IMPORTANTE:** Recuerda volver a activar el firewall después de probar.

### Opción 3: Crear Regla Manualmente

1. Presiona **Windows + R**
2. Escribe: `wf.msc` y presiona Enter
3. Click en **"Reglas de entrada"** (panel izquierdo)
4. Click en **"Nueva regla..."** (panel derecho)
5. Selecciona **"Puerto"** → Siguiente
6. Selecciona **"TCP"** y escribe **"5000"** → Siguiente
7. Selecciona **"Permitir la conexión"** → Siguiente
8. Marca **todas las opciones** → Siguiente
9. Nombre: **"Sierra Yara Backend"** → Finalizar

## 🔄 Después de Aplicar la Solución

1. **Recarga la página en tu celular** (o cierra y abre de nuevo)
2. Ve a: `http://192.168.1.103:3000`
3. Ingresa el número de mesa
4. **¡Debería conectar!**

## ✅ Verificación

Para verificar que el firewall ya no está bloqueando:

```powershell
Test-NetConnection -ComputerName 192.168.1.103 -Port 5000
```

Si dice **"TcpTestSucceeded : True"**, el puerto está abierto.

## 🆘 Si Aún No Funciona

1. **Verifica que el backend esté corriendo:**
   - Deberías ver el mensaje: `🚀 Servidor corriendo en puerto 5000`

2. **Verifica que ambos dispositivos estén en la misma WiFi:**
   - PC: Revisa tu conexión WiFi
   - Celular: Revisa tu conexión WiFi

3. **Prueba desde tu PC primero:**
   - Abre: `http://localhost:3000`
   - Si funciona en tu PC pero no en el celular, es definitivamente el firewall

4. **Revisa la consola del navegador:**
   - En tu celular, abre las herramientas de desarrollo (si puedes)
   - Busca errores en la consola

## 📊 Estado Actual

- ✅ Backend corriendo en puerto 5000
- ✅ Frontend corriendo en puerto 3000
- ✅ IP correcta: 192.168.1.103
- ✅ Código actualizado con timeout y detección automática de IP
- ❌ Firewall bloqueando el puerto 5000 ← **ESTO ES LO QUE FALTA**

## 🎯 Resumen

El problema NO es tu código, es el **Firewall de Windows**. Una vez que abras el puerto 5000 o desactives el firewall temporalmente, todo funcionará perfectamente.
