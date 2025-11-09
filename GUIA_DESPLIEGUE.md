# 🚀 GUÍA COMPLETA DE DESPLIEGUE - Sierra Yara Café

Esta guía te llevará paso a paso para desplegar tu aplicación en producción **100% GRATIS**.

## 📋 Requisitos Previos

- [ ] Cuenta de GitHub (gratis)
- [ ] Cuenta de Render (gratis)
- [ ] Cuenta de Vercel (gratis)
- [ ] MongoDB Atlas ya configurado ✅

---

## 🎯 PARTE 1: Preparar el Código (YA HECHO ✅)

Los archivos ya están preparados:
- ✅ `backend/render.yaml` - Configuración de Render
- ✅ `backend/server.js` - CORS actualizado para producción
- ✅ `frontend/src/services/api.js` - Detección automática de URL

---

## 🔧 PARTE 2: Subir el Código a GitHub

### Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com
2. Click en el botón **"+"** (arriba derecha) → **"New repository"**
3. Nombre: `sierra-yara-cafe`
4. Descripción: `Sistema de menú inteligente para Sierra Yara Café`
5. Selecciona **"Private"** (para mantenerlo privado)
6. **NO** marques "Initialize with README"
7. Click en **"Create repository"**

### Paso 2: Subir tu Código

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd c:\Users\altov\Downloads\sierra_yara

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para despliegue en producción"

# Conectar con GitHub (REEMPLAZA con tu URL)
git remote add origin https://github.com/TU_USUARIO/sierra-yara-cafe.git

# Subir el código
git branch -M main
git push -u origin main
```

**Nota:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

---

## 🖥️ PARTE 3: Desplegar el Backend en Render

### Paso 1: Crear Cuenta en Render

1. Ve a https://render.com
2. Click en **"Get Started"**
3. Regístrate con tu cuenta de GitHub (más fácil)
4. Autoriza a Render para acceder a tus repositorios

### Paso 2: Crear Web Service

1. En el dashboard de Render, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub: `sierra-yara-cafe`
3. Click en **"Connect"** junto al repositorio

### Paso 3: Configurar el Servicio

Llena los campos:

- **Name:** `sierra-yara-backend`
- **Region:** `Oregon (US West)` (o el más cercano)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### Paso 4: Configurar Variables de Entorno

Scroll hacia abajo hasta **"Environment Variables"** y agrega:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://manuelalejandromendozaalvarado_db_user:24634143Dlas@cluster0.wj4d8qy.mongodb.net/sierra_yara?retryWrites=true&w=majority` |
| `CORS_ORIGIN` | `*` (lo cambiaremos después) |
| `PAGO_MOVIL_CI` | Tu cédula |
| `PAGO_MOVIL_TELEFONO` | Tu teléfono |
| `PAGO_MOVIL_BANCO` | Tu banco |
| `TRANSFERENCIA_BANCO` | Tu banco |
| `TRANSFERENCIA_CUENTA` | Tu cuenta |
| `TRANSFERENCIA_TITULAR` | Tu nombre |
| `TRANSFERENCIA_RIF` | Tu RIF |
| `ZELLE_EMAIL` | Tu email Zelle (opcional) |
| `PAYPAL_EMAIL` | Tu email PayPal (opcional) |

### Paso 5: Desplegar

1. Click en **"Create Web Service"**
2. Espera 3-5 minutos mientras Render despliega tu backend
3. Verás logs en tiempo real
4. Cuando veas **"✅ Conectado a MongoDB"**, ¡está listo!

### Paso 6: Obtener la URL del Backend

1. En el dashboard de Render, verás tu servicio
2. Copia la URL (ejemplo: `https://sierra-yara-backend.onrender.com`)
3. **GUARDA ESTA URL** - la necesitarás para el frontend

---

## 🎨 PARTE 4: Desplegar el Frontend en Vercel

### Paso 1: Crear Cuenta en Vercel

1. Ve a https://vercel.com
2. Click en **"Sign Up"**
3. Regístrate con tu cuenta de GitHub
4. Autoriza a Vercel

### Paso 2: Importar Proyecto

1. En el dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Busca tu repositorio: `sierra-yara-cafe`
3. Click en **"Import"**

### Paso 3: Configurar el Proyecto

Llena los campos:

- **Project Name:** `sierra-yara-frontend`
- **Framework Preset:** `Create React App`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (dejar por defecto)
- **Output Directory:** `build` (dejar por defecto)

### Paso 4: Configurar Variables de Entorno

Click en **"Environment Variables"** y agrega:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://sierra-yara-backend.onrender.com/api` |
| `REACT_APP_SOCKET_URL` | `https://sierra-yara-backend.onrender.com` |

**IMPORTANTE:** Reemplaza `sierra-yara-backend.onrender.com` con la URL real de tu backend de Render.

### Paso 5: Desplegar

1. Click en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye y despliega
3. Cuando termine, verás **"Congratulations!"**
4. Click en **"Visit"** para ver tu app

### Paso 6: Obtener la URL del Frontend

1. Copia la URL de tu frontend (ejemplo: `https://sierra-yara-frontend.vercel.app`)
2. **GUARDA ESTA URL**

---

## 🔄 PARTE 5: Actualizar CORS en el Backend

Ahora que tienes la URL del frontend, actualiza el CORS:

1. Ve a Render → Tu servicio backend
2. Click en **"Environment"** (menú izquierdo)
3. Edita la variable `CORS_ORIGIN`
4. Cambia el valor a: `https://sierra-yara-frontend.vercel.app` (tu URL real)
5. Click en **"Save Changes"**
6. El servicio se reiniciará automáticamente

---

## ✅ PARTE 6: Probar la Aplicación

### Desde tu Computadora

1. Abre: `https://sierra-yara-frontend.vercel.app`
2. Ingresa un número de mesa (ejemplo: 4)
3. Ingresa tu nombre
4. Click en **"Acceder al Menú"**
5. ¡Deberías ver el menú!

### Desde tu Celular

1. Abre el navegador en tu celular
2. Ve a: `https://sierra-yara-frontend.vercel.app`
3. Prueba conectarte a una mesa
4. ¡Funciona desde cualquier lugar con internet!

---

## 🎉 ¡LISTO! Tu App Está en Producción

### URLs Finales

- **Frontend:** `https://sierra-yara-frontend.vercel.app`
- **Backend:** `https://sierra-yara-backend.onrender.com`
- **API Health:** `https://sierra-yara-backend.onrender.com/api/health`

### Características

✅ Accesible desde cualquier dispositivo con internet
✅ HTTPS automático (seguro)
✅ Sin costo mensual
✅ Despliegues automáticos desde GitHub

---

## 🔧 Actualizaciones Futuras

Cada vez que hagas cambios en tu código:

```powershell
cd c:\Users\altov\Downloads\sierra_yara

# Agregar cambios
git add .

# Commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

**Vercel y Render desplegarán automáticamente** los cambios en 2-3 minutos.

---

## ⚠️ Notas Importantes

### Sobre el Plan Gratuito de Render

- El backend se "dormirá" después de 15 minutos sin uso
- Se "despierta" automáticamente en ~30 segundos cuando alguien lo usa
- Primera carga puede ser lenta, luego es rápido

### Solución: Mantener el Backend Despierto (Opcional)

Puedes usar un servicio como **UptimeRobot** (gratis) para hacer ping cada 5 minutos:

1. Ve a https://uptimerobot.com
2. Crea una cuenta gratis
3. Agrega un monitor HTTP(s) con tu URL de backend
4. Intervalo: 5 minutos
5. ¡Listo! Tu backend nunca se dormirá

---

## 🆘 Solución de Problemas

### Error: "No se puede conectar al servidor"

1. Verifica que el backend esté corriendo en Render
2. Revisa los logs en Render para ver errores
3. Verifica que las variables de entorno estén correctas

### Error: "CORS policy"

1. Verifica que `CORS_ORIGIN` en Render tenga la URL correcta del frontend
2. Debe ser exactamente: `https://sierra-yara-frontend.vercel.app` (sin `/` al final)

### El backend se queda "dormido"

- Es normal en el plan gratuito
- Usa UptimeRobot para mantenerlo despierto (ver arriba)

### Cambios no se reflejan

1. Verifica que hayas hecho `git push`
2. Espera 2-3 minutos para el despliegue
3. Limpia el caché del navegador (Ctrl + Shift + R)

---

## 📞 Contacto y Soporte

Si tienes problemas:

1. Revisa los logs en Render (Backend)
2. Revisa los logs en Vercel (Frontend)
3. Abre la consola del navegador (F12) para ver errores

---

## 🎊 ¡Felicidades!

Tu aplicación Sierra Yara Café está ahora en producción y accesible desde cualquier parte del mundo. 🌎

**Comparte tu URL con tus clientes y empieza a recibir pedidos digitales.**
