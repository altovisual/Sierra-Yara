# 🚀 Instrucciones Rápidas - Sistema de Promociones

## ✅ Pasos para Ver las Promociones

### 1. Asegúrate que el Backend esté corriendo

```bash
cd backend
npm run dev
```

**IMPORTANTE**: Si ya estaba corriendo, **reinícialo** para que cargue los cambios.

### 2. Asegúrate que el Frontend esté corriendo

```bash
cd frontend
npm start
```

### 3. Crear Promociones de Prueba

```bash
cd backend
npm run seed:promos
```

Esto creará 4 promociones que están activas **todo el día, todos los días**.

### 4. Ver Promociones

#### Como Cliente:
1. Ve a: `http://localhost:3000/menu`
2. Click en el botón amarillo **"Promos"** en la parte superior
3. Deberías ver las 4 promociones creadas

#### Como Admin:
1. Ve a: `http://localhost:3000/admin/promociones`
2. Verás la tabla con todas las promociones
3. Puedes crear, editar, activar/desactivar y eliminar promociones

## 🐛 Si No Ves las Promociones

### Verifica en la Consola del Backend:

Cuando accedas a `/promociones`, deberías ver en la consola del backend:

```
🔍 Buscando promociones activas...
📅 Fecha actual: [fecha]
📋 Promociones encontradas en DB: 4
  - 2x1 en Cafés: ✅ Vigente
  - Happy Hour - Batidos: ✅ Vigente
  - Desayuno Completo: ✅ Vigente
  - Promo Especial del Día: ✅ Vigente
✅ Promociones vigentes: 4
```

### Si no ves este log:
1. **Reinicia el backend** (Ctrl+C y luego `npm run dev`)
2. Verifica que MongoDB esté corriendo
3. Ejecuta nuevamente `npm run seed:promos`

### Verifica en la Consola del Navegador (F12):

Deberías ver la petición a:
```
GET http://localhost:5000/api/promociones/activas
```

Y la respuesta debe ser:
```json
{
  "success": true,
  "data": [
    { "titulo": "2x1 en Cafés", ... },
    { "titulo": "Happy Hour - Batidos", ... },
    ...
  ]
}
```

## 📝 Crear una Promoción Manualmente

1. Ve a `http://localhost:3000/admin/promociones`
2. Click en **"Nueva Promoción"**
3. Llena el formulario:
   - **Título**: "Mi Promoción"
   - **Descripción**: "Descripción de la promo"
   - **Tipo de Descuento**: Porcentaje (%)
   - **Descuento**: 25
   - **Período de Vigencia**: Selecciona hoy y un mes adelante
   - **Activa**: ON (activado)
4. Click en **"Guardar"**
5. Ve a `/promociones` y deberías verla

## 🎯 URLs Importantes

- **Cliente - Menú**: `http://localhost:3000/menu`
- **Cliente - Promociones**: `http://localhost:3000/promociones`
- **Admin - Dashboard**: `http://localhost:3000/admin`
- **Admin - Promociones**: `http://localhost:3000/admin/promociones`
- **API - Promociones Activas**: `http://localhost:5000/api/promociones/activas`
- **API - Todas las Promociones**: `http://localhost:5000/api/promociones`

## 💡 Consejos

- Las promociones se filtran automáticamente por:
  - ✅ Estado activo
  - ✅ Rango de fechas
  - ✅ Horario (si está configurado)
  - ✅ Días de la semana (si está configurado)

- Para pruebas rápidas, usa:
  - **Horario**: 00:00 - 23:59 (todo el día)
  - **Días**: Dejar vacío (todos los días)

---

**¿Problemas?** Revisa la consola del backend y del navegador para ver los logs.
