# 🚀 Guía de Despliegue en Producción

Guía paso a paso para desplegar Sierra Yara en producción.

## 📋 Checklist Pre-Despliegue

- [ ] MongoDB configurado y accesible
- [ ] Dominio registrado y configurado
- [ ] Certificado SSL instalado (HTTPS)
- [ ] Variables de entorno configuradas
- [ ] Datos de pago actualizados
- [ ] Backup de base de datos configurado

## 🌐 Opciones de Hosting

### Backend

#### Opción 1: Railway / Render
- Fácil despliegue desde GitHub
- MongoDB Atlas para la base de datos
- Variables de entorno en el panel

#### Opción 2: VPS (DigitalOcean, Linode, AWS)
- Mayor control
- Requiere configuración de servidor
- Instalar Node.js, MongoDB, Nginx

#### Opción 3: Heroku
- Despliegue simple
- Usar MongoDB Atlas
- Configurar Procfile

### Frontend

#### Opción 1: Vercel
- Ideal para React
- Despliegue automático desde Git
- CDN global incluido

#### Opción 2: Netlify
- Similar a Vercel
- Build automático
- Formularios y funciones serverless

#### Opción 3: Mismo servidor que backend
- Servir build estático con Nginx
- Menor costo
- Requiere configuración

## 🔧 Configuración Backend

### 1. Variables de Entorno Producción

```env
# Servidor
PORT=5000
NODE_ENV=production

# Base de datos (MongoDB Atlas recomendado)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/sierra_yara

# CORS (tu dominio frontend)
CORS_ORIGIN=https://sierrayara.com

# Datos de pago REALES
PAGO_MOVIL_CI=V12345678
PAGO_MOVIL_TELEFONO=04141234567
PAGO_MOVIL_BANCO=Banco de Venezuela

TRANSFERENCIA_BANCO=Banco de Venezuela
TRANSFERENCIA_CUENTA=01020123456789012345
TRANSFERENCIA_TITULAR=Sierra Yara Café C.A.
TRANSFERENCIA_RIF=J123456789

ZELLE_EMAIL=pagos@sierrayara.com
PAYPAL_EMAIL=pagos@sierrayara.com
```

### 2. MongoDB Atlas Setup

1. Crear cuenta en https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Configurar usuario y contraseña
4. Whitelist IP (0.0.0.0/0 para acceso desde cualquier lugar)
5. Obtener connection string
6. Actualizar MONGODB_URI

### 3. Despliegue en Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

### 4. Despliegue en VPS (Ubuntu)

```bash
# Conectar al servidor
ssh root@tu-servidor.com

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Clonar repositorio
git clone https://github.com/tu-usuario/sierra-yara.git
cd sierra-yara/backend

# Instalar dependencias
npm install --production

# Configurar variables de entorno
nano .env

# Iniciar con PM2
pm2 start server.js --name sierra-yara-api
pm2 startup
pm2 save

# Configurar Nginx como proxy reverso
sudo apt install nginx
sudo nano /etc/nginx/sites-available/sierra-yara
```

Configuración Nginx:
```nginx
server {
    listen 80;
    server_name api.sierrayara.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/sierra-yara /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Instalar SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.sierrayara.com
```

## 🎨 Configuración Frontend

### 1. Variables de Entorno Producción

```env
REACT_APP_API_URL=https://api.sierrayara.com/api
REACT_APP_SOCKET_URL=https://api.sierrayara.com
```

### 2. Build para Producción

```bash
cd frontend
npm run build
```

### 3. Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

Configurar variables de entorno en el panel de Vercel.

### 4. Despliegue en Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Desplegar
netlify deploy --prod --dir=build
```

### 5. Servir desde VPS

```bash
# Copiar build al servidor
scp -r build/* root@tu-servidor.com:/var/www/sierra-yara/

# Configurar Nginx
sudo nano /etc/nginx/sites-available/sierra-yara-frontend
```

```nginx
server {
    listen 80;
    server_name sierrayara.com www.sierrayara.com;
    root /var/www/sierra-yara;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔒 Seguridad

### 1. Proteger Variables de Entorno
- Nunca commitear archivos `.env`
- Usar servicios de gestión de secretos
- Rotar credenciales regularmente

### 2. HTTPS Obligatorio
- Instalar certificado SSL
- Redirigir HTTP a HTTPS
- Configurar HSTS

### 3. Rate Limiting

Instalar en backend:
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

### 4. Helmet para Seguridad HTTP

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 5. Validación de Entrada
- Sanitizar todos los inputs
- Validar tipos de datos
- Prevenir inyección SQL/NoSQL

## 📊 Monitoreo

### 1. PM2 Monitoring
```bash
pm2 monit
pm2 logs sierra-yara-api
```

### 2. Logs
```bash
# Configurar rotación de logs
pm2 install pm2-logrotate
```

### 3. Uptime Monitoring
- UptimeRobot (gratuito)
- Pingdom
- New Relic

### 4. Error Tracking
- Sentry
- Rollbar
- Bugsnag

## 💾 Backups

### MongoDB Atlas
- Backups automáticos incluidos
- Configurar schedule de backups

### VPS
```bash
# Script de backup
#!/bin/bash
mongodump --uri="mongodb://localhost:27017/sierra_yara" --out=/backups/$(date +%Y%m%d)
```

```bash
# Cron job diario
crontab -e
0 2 * * * /path/to/backup-script.sh
```

## 🔄 CI/CD

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy Backend
      run: |
        # Comandos de despliegue
    
    - name: Deploy Frontend
      run: |
        # Comandos de despliegue
```

## 📱 Generar Códigos QR

```bash
cd backend
npm run qr
```

Imprimir y colocar en cada mesa.

## ✅ Post-Despliegue

- [ ] Probar todas las funcionalidades
- [ ] Verificar WebSockets funcionan
- [ ] Probar pagos con datos reales
- [ ] Verificar notificaciones en tiempo real
- [ ] Probar en diferentes dispositivos
- [ ] Configurar monitoreo
- [ ] Documentar credenciales de forma segura
- [ ] Capacitar al personal

## 🆘 Troubleshooting

### WebSockets no funcionan
- Verificar que el servidor soporte WebSockets
- Configurar proxy correctamente en Nginx
- Verificar CORS

### Base de datos no conecta
- Verificar connection string
- Whitelist IP en MongoDB Atlas
- Verificar credenciales

### Build falla
- Limpiar node_modules
- Verificar versiones de Node
- Revisar variables de entorno

## 📞 Soporte

Para problemas de despliegue, revisar:
- Logs del servidor
- Consola del navegador
- Estado de servicios externos
- Configuración de DNS

---

**¡Éxito con el despliegue!** 🚀
