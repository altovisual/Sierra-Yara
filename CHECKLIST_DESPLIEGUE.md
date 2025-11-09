# ✅ CHECKLIST DE DESPLIEGUE - Sierra Yara

Marca cada paso a medida que lo completes.

## 📦 PREPARACIÓN (Hecho por mí)

- [x] Actualizar CORS en backend para producción
- [x] Crear archivo `render.yaml`
- [x] Configurar detección automática de URL en frontend
- [x] Crear guía de despliegue completa

## 🔐 ANTES DE EMPEZAR

- [ ] Tienes cuenta de GitHub
- [ ] Tienes cuenta de Render (crear en https://render.com)
- [ ] Tienes cuenta de Vercel (crear en https://vercel.com)
- [ ] MongoDB Atlas funcionando (ya lo tienes ✅)

## 📤 SUBIR A GITHUB

- [ ] Crear repositorio en GitHub
- [ ] Ejecutar `git init` en la carpeta del proyecto
- [ ] Ejecutar `git add .`
- [ ] Ejecutar `git commit -m "Preparar para despliegue"`
- [ ] Ejecutar `git remote add origin URL_DE_TU_REPO`
- [ ] Ejecutar `git push -u origin main`

## 🖥️ DESPLEGAR BACKEND EN RENDER

- [ ] Crear cuenta en Render
- [ ] Conectar con GitHub
- [ ] Crear nuevo Web Service
- [ ] Seleccionar repositorio `sierra-yara-cafe`
- [ ] Configurar:
  - Name: `sierra-yara-backend`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Agregar variables de entorno (ver lista abajo)
- [ ] Click en "Create Web Service"
- [ ] Esperar despliegue (3-5 minutos)
- [ ] Copiar URL del backend (ejemplo: `https://sierra-yara-backend.onrender.com`)
- [ ] Probar: Abrir `https://TU-BACKEND.onrender.com/api/health`

### Variables de Entorno para Render

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://manuelalejandromendozaalvarado_db_user:24634143Dlas@cluster0.wj4d8qy.mongodb.net/sierra_yara?retryWrites=true&w=majority
CORS_ORIGIN=*
PAGO_MOVIL_CI=V12345678
PAGO_MOVIL_TELEFONO=04121234567
PAGO_MOVIL_BANCO=Banco de Venezuela
TRANSFERENCIA_BANCO=Banco de Venezuela
TRANSFERENCIA_CUENTA=01020123456789012345
TRANSFERENCIA_TITULAR=Sierra Yara Café
TRANSFERENCIA_RIF=J123456789
ZELLE_EMAIL=tu@email.com
PAYPAL_EMAIL=tu@email.com
```

## 🎨 DESPLEGAR FRONTEND EN VERCEL

- [ ] Crear cuenta en Vercel
- [ ] Conectar con GitHub
- [ ] Click en "Add New Project"
- [ ] Seleccionar repositorio `sierra-yara-cafe`
- [ ] Configurar:
  - Project Name: `sierra-yara-frontend`
  - Framework: `Create React App`
  - Root Directory: `frontend`
- [ ] Agregar variables de entorno:
  - `REACT_APP_API_URL`: `https://TU-BACKEND.onrender.com/api`
  - `REACT_APP_SOCKET_URL`: `https://TU-BACKEND.onrender.com`
- [ ] Click en "Deploy"
- [ ] Esperar despliegue (2-3 minutos)
- [ ] Copiar URL del frontend (ejemplo: `https://sierra-yara-frontend.vercel.app`)

## 🔄 ACTUALIZAR CORS

- [ ] Ir a Render → Backend → Environment
- [ ] Editar `CORS_ORIGIN`
- [ ] Cambiar de `*` a `https://TU-FRONTEND.vercel.app`
- [ ] Guardar cambios
- [ ] Esperar reinicio automático

## ✅ PRUEBAS

- [ ] Abrir frontend en navegador de PC
- [ ] Conectar a una mesa
- [ ] Ver el menú
- [ ] Agregar productos al carrito
- [ ] Abrir frontend en celular
- [ ] Probar desde celular
- [ ] Verificar que WebSocket funciona (pedidos en tiempo real)

## 🎉 OPCIONAL: MANTENER BACKEND DESPIERTO

- [ ] Crear cuenta en UptimeRobot (https://uptimerobot.com)
- [ ] Agregar monitor HTTP(s)
- [ ] URL: `https://TU-BACKEND.onrender.com/api/health`
- [ ] Intervalo: 5 minutos

## 📝 URLS FINALES

Anota tus URLs aquí:

- **Frontend:** _______________________________________________
- **Backend:** _______________________________________________
- **Admin:** _______________________________________________/admin

## 🚀 ¡LISTO PARA PRODUCCIÓN!

Una vez completado todo el checklist, tu aplicación estará:

✅ Accesible desde cualquier dispositivo
✅ Con HTTPS (seguro)
✅ Sin costo mensual
✅ Lista para recibir pedidos reales

---

## 📞 ¿Necesitas Ayuda?

Si te atascas en algún paso:

1. Lee la `GUIA_DESPLIEGUE.md` completa
2. Revisa los logs en Render/Vercel
3. Verifica que todas las variables de entorno estén correctas
4. Asegúrate de que las URLs no tengan `/` al final
