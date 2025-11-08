# 🔒 Guía de Seguridad - Sierra Yara

## Archivos Sensibles Protegidos

Este proyecto está configurado para **NO subir datos sensibles** al repositorio público de GitHub.

### ⚠️ Archivos que NUNCA se subirán al repositorio:

- ✅ Archivos `.env` (variables de entorno)
- ✅ `node_modules/` (dependencias)
- ✅ Archivos de base de datos (`.sqlite`, `.db`, `.sql`)
- ✅ Códigos QR generados (pueden contener URLs con datos sensibles)
- ✅ Certificados y claves (`.pem`, `.key`, `.cert`)
- ✅ Logs del sistema
- ✅ Archivos de backup

## 📝 Configuración Inicial Requerida

### 1. Backend - Crear archivo `.env`

Copia el archivo de ejemplo y configúralo con tus datos reales:

```bash
cd backend
cp .env.example .env
```

Luego edita `backend/.env` con tus datos reales:

```env
# Puerto del servidor
PORT=5000

# URL de conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/sierra_yara

# Configuración de CORS
CORS_ORIGIN=http://192.168.1.103:3000

# Datos de pago del local (REEMPLAZAR CON DATOS REALES)
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

### 2. Frontend - Crear archivo `.env`

Copia el archivo de ejemplo:

```bash
cd frontend
cp .env.example .env
```

Luego edita `frontend/.env` con tu IP local:

```env
REACT_APP_API_URL=http://192.168.1.103:5000/api
REACT_APP_SOCKET_URL=http://192.168.1.103:5000
```

## 🛡️ Buenas Prácticas de Seguridad

### ✅ Lo que SÍ debes hacer:

1. **Mantener los archivos `.env` solo en tu máquina local**
2. **Actualizar `.env.example` con la estructura pero SIN datos reales**
3. **Compartir credenciales solo por canales seguros** (nunca por chat, email o repositorio)
4. **Cambiar credenciales periódicamente**
5. **Usar contraseñas fuertes para la base de datos**

### ❌ Lo que NO debes hacer:

1. **NUNCA subir archivos `.env` al repositorio**
2. **NUNCA hacer commit de credenciales reales**
3. **NUNCA compartir el archivo `.env` por medios inseguros**
4. **NUNCA usar las mismas credenciales en producción y desarrollo**

## 🔍 Verificar que no hay datos sensibles

Antes de hacer push, verifica:

```bash
# Ver qué archivos se van a subir
git status

# Ver el contenido que se va a subir
git diff

# Verificar que .env no está en la lista
git ls-files | grep .env
# Solo debe aparecer: .env.example
```

## 🚨 Si accidentalmente subiste datos sensibles:

1. **Cambia inmediatamente todas las credenciales expuestas**
2. **Elimina el archivo del historial de Git:**

```bash
# Eliminar archivo del historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (¡CUIDADO!)
git push origin --force --all
```

3. **Contacta al administrador del repositorio**

## 📞 Contacto

Si tienes dudas sobre la seguridad del proyecto, contacta al administrador.

---

**Recuerda:** La seguridad es responsabilidad de todos. Mantén tus credenciales seguras.
