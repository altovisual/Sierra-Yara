# 🚀 Guía de Inicio Rápido - Sierra Yara

Esta guía te ayudará a poner en marcha el sistema en menos de 10 minutos.

## ⚡ Inicio Rápido (3 pasos)

### Paso 1: Instalar Dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### Paso 2: Configurar Variables de Entorno

**Backend** (`backend/.env`):
```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus datos:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sierra_yara
CORS_ORIGIN=http://localhost:3000

# Actualiza con los datos reales de pago
PAGO_MOVIL_CI=V12345678
PAGO_MOVIL_TELEFONO=04141234567
PAGO_MOVIL_BANCO=Banco de Venezuela
```

**Frontend** (`frontend/.env`):
```bash
cd ../frontend
cp .env.example .env
```

El archivo `.env` del frontend ya tiene los valores correctos para desarrollo local.

### Paso 3: Iniciar el Sistema

**Terminal 1 - Iniciar MongoDB** (si no está corriendo):
```bash
mongod
```

**Terminal 2 - Poblar Base de Datos** (primera vez):
```bash
cd backend
node scripts/seedData.js
```

**Terminal 3 - Iniciar Backend**:
```bash
cd backend
npm run dev
```

**Terminal 4 - Iniciar Frontend**:
```bash
cd frontend
npm start
```

## 🎯 Acceder al Sistema

- **Cliente**: http://localhost:3000
- **Panel Admin**: http://localhost:3000/admin
- **API**: http://localhost:5000/api

## 📱 Probar el Sistema

### Como Cliente:

1. Abre http://localhost:3000
2. Ingresa número de mesa (ej: 1)
3. Opcionalmente ingresa tu nombre
4. Explora el menú y agrega productos
5. Ve al carrito y confirma el pedido
6. Revisa el estado en "Mis Pedidos"
7. Procesa el pago cuando estés listo

### Como Administrador:

1. Abre http://localhost:3000/admin
2. Verás las mesas y pedidos en tiempo real
3. Actualiza el estado de los pedidos
4. Observa las notificaciones de nuevos pedidos

## 🔧 Comandos Útiles

### Backend
```bash
npm run dev      # Modo desarrollo con nodemon
npm start        # Modo producción
```

### Frontend
```bash
npm start        # Servidor de desarrollo
npm run build    # Compilar para producción
npm test         # Ejecutar tests
```

### Base de Datos
```bash
# Poblar datos de ejemplo
node scripts/seedData.js

# Conectar a MongoDB shell
mongosh sierra_yara
```

## 🐛 Solución de Problemas

### Error: MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
mongod --version

# Iniciar MongoDB
mongod
```

### Error: Puerto en uso
```bash
# Cambiar puerto en backend/.env
PORT=5001

# Cambiar puerto en frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

### Error: CORS
Verifica que `CORS_ORIGIN` en `backend/.env` coincida con la URL del frontend.

### Error: Módulos no encontrados
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📊 Datos de Prueba

Después de ejecutar `seedData.js`, tendrás:

- **20+ productos** en 6 categorías
- **10 mesas** numeradas del 1 al 10
- Todos los productos con imágenes de ejemplo

## 🔐 Seguridad en Producción

Antes de desplegar en producción:

1. ✅ Cambiar todas las credenciales en `.env`
2. ✅ Usar HTTPS
3. ✅ Configurar CORS apropiadamente
4. ✅ Implementar autenticación para admin
5. ✅ Usar variables de entorno seguras
6. ✅ Configurar firewall y rate limiting

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en la consola
2. Verifica que MongoDB esté corriendo
3. Confirma que los puertos no estén en uso
4. Revisa las variables de entorno

## 🎉 ¡Listo!

El sistema está funcionando. Ahora puedes:

- Personalizar el menú
- Ajustar los colores del tema
- Agregar más funcionalidades
- Desplegar en producción

---

**Desarrollado para Sierra Yara Café** 🏔️☕
