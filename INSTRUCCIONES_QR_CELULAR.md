# 📱 Instrucciones para Probar con Celular

## 🎯 Configuración Actual

**IP Local detectada:** `192.168.1.103`

**URLs del sistema:**
- Frontend: `http://192.168.1.103:3000`
- Backend: `http://192.168.1.103:5000`

---

## ✅ Pasos para Configurar

### 1. **Verificar que el Frontend esté configurado**

El archivo `.env` del frontend ya está configurado con:
```
REACT_APP_API_URL=http://192.168.1.103:5000/api
REACT_APP_SOCKET_URL=http://192.168.1.103:5000
```

### 2. **Reiniciar el Frontend**

```bash
cd frontend
npm start
```

El frontend debe estar corriendo en `http://192.168.1.103:3000`

### 3. **Verificar que el Backend esté corriendo**

```bash
cd backend
npm start
```

El backend debe estar corriendo en `http://192.168.1.103:5000`

---

## 📱 Usar los Códigos QR

### **Opción 1: Archivo HTML (Recomendado)**

1. Abre el archivo `qr-codes.html` que se generó en la raíz del proyecto
2. Verás todos los códigos QR de las 10 mesas
3. Escanea cualquier QR con tu celular
4. ¡Listo! Deberías ver la pantalla de selección de nombre

### **Opción 2: URLs Directas**

Puedes generar QR codes manualmente con estas URLs:

- **Mesa 1:** `http://192.168.1.103:3000/mesa/1`
- **Mesa 2:** `http://192.168.1.103:3000/mesa/2`
- **Mesa 3:** `http://192.168.1.103:3000/mesa/3`
- ... y así sucesivamente

**Generar QR online:**
1. Ve a https://www.qr-code-generator.com/
2. Pega la URL de la mesa
3. Descarga el QR
4. Escanea con tu celular

### **Opción 3: URLs de QR API**

Abre estas URLs en tu navegador para ver los QR directamente:

- Mesa 1: https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=http%3A%2F%2F192.168.1.103%3A3000%2Fmesa%2F1
- Mesa 2: https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=http%3A%2F%2F192.168.1.103%3A3000%2Fmesa%2F2
- Mesa 3: https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=http%3A%2F%2F192.168.1.103%3A3000%2Fmesa%2F3

---

## 🔧 Solución de Problemas

### ❌ "No se puede conectar"

**Verifica:**
1. ✅ Tu celular está en la **misma red WiFi** que tu computadora
2. ✅ El frontend está corriendo en `http://192.168.1.103:3000`
3. ✅ El backend está corriendo en `http://192.168.1.103:5000`
4. ✅ El firewall de Windows permite las conexiones

**Probar manualmente:**
- Abre en tu celular: `http://192.168.1.103:3000`
- Si funciona, el QR también funcionará

### ❌ "La IP cambió"

Si tu IP local cambió, regenera los QR:

```bash
cd backend
npm run qr:local
```

Esto detectará automáticamente la nueva IP y generará nuevos QR codes.

### ❌ Firewall bloqueando

Si Windows Firewall bloquea las conexiones:

1. Ve a **Windows Defender Firewall**
2. Click en **"Permitir una aplicación a través del firewall"**
3. Busca **Node.js** y marca las casillas de **Privada** y **Pública**
4. Reinicia los servidores

---

## 🎨 Flujo Completo de Prueba

### 1. **Preparación**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 2. **Generar QR Codes**
```bash
cd backend
npm run qr:local
```

### 3. **Abrir archivo HTML**
- Abre `qr-codes.html` en tu navegador
- Verás una página con todos los QR codes

### 4. **Escanear con Celular**
- Abre la cámara de tu celular
- Apunta al QR de la Mesa 1
- Toca la notificación que aparece
- Deberías ver la pantalla de "Selecciona tu nombre"

### 5. **Probar el Flujo Completo**
1. ✅ Selecciona tu nombre
2. ✅ Ve el menú de productos
3. ✅ Agrega productos al carrito
4. ✅ Confirma el pedido
5. ✅ Ve tus pedidos en "Mis Pedidos"

---

## 📊 Verificación en el Admin

Mientras pruebas en el celular, puedes ver en tiempo real:

1. Abre en tu PC: `http://192.168.1.103:3000/admin`
2. Ve al Dashboard
3. Deberías ver:
   - Mesa activa
   - Pedidos en tiempo real
   - Estado de los pedidos

---

## 💡 Tips

### **Para Imprimir QR Codes:**
1. Abre `qr-codes.html`
2. Presiona `Ctrl + P` para imprimir
3. Selecciona "Guardar como PDF" o imprime directamente
4. Corta y coloca en cada mesa

### **Para Pruebas Rápidas:**
En lugar de escanear QR, puedes:
1. Abrir en tu celular: `http://192.168.1.103:3000/mesa/1`
2. Guardar como favorito
3. Usar para pruebas rápidas

### **Múltiples Dispositivos:**
Puedes probar con varios celulares simultáneamente:
- Celular 1: Mesa 1
- Celular 2: Mesa 2
- Tablet: Mesa 3
- Todos verán sus pedidos independientes

---

## 🚀 Comandos Rápidos

```bash
# Generar QR codes
npm run qr:local

# Ver archivo HTML
start qr-codes.html

# Reiniciar todo
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

---

## 📞 Soporte

Si algo no funciona:
1. Verifica que ambos servidores estén corriendo
2. Verifica que estés en la misma red WiFi
3. Prueba abrir la URL directamente en el navegador del celular
4. Revisa la consola del navegador (F12) para ver errores

---

**Desarrollado por Altovisual** 🚀
