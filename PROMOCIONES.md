# 🎯 Sistema de Promociones - Sierra Yara

Guía completa para usar el sistema de promociones del día.

## 📋 Características

- ✅ Crear promociones con descuentos por porcentaje o monto fijo
- ✅ Configurar vigencia por fechas y horarios específicos
- ✅ Limitar promociones a días de la semana
- ✅ Aplicar a productos o categorías específicas
- ✅ Marcar promociones como destacadas
- ✅ Activar/desactivar promociones con un clic
- ✅ Vista automática de promociones vigentes para clientes

## 🚀 Inicio Rápido

### 1. Crear Promociones de Ejemplo

Ejecuta el script de seed para crear promociones de prueba:

```bash
cd backend
npm run seed:promos
```

Esto creará 3 promociones de ejemplo:
- **2x1 en Cafés** (50% descuento, destacada)
- **Happy Hour - Batidos** (30% descuento)
- **Desayuno Completo** (descuento fijo)

### 2. Acceder al Panel de Administración

1. Inicia el backend y frontend
2. Ve a: `http://localhost:3000/admin/promociones`
3. Verás la lista de promociones creadas

### 3. Ver Promociones como Cliente

1. Ve a: `http://localhost:3000/menu`
2. Click en el botón amarillo **"Promos"**
3. Verás solo las promociones activas y vigentes

## 📝 Crear una Nueva Promoción

### Desde el Panel de Admin

1. Click en **"Nueva Promoción"**
2. Completa el formulario:

#### Campos Obligatorios:
- **Título**: Nombre corto de la promoción (ej: "2x1 en Cafés")
- **Descripción**: Explicación detallada
- **Tipo de Descuento**: Porcentaje (%) o Monto Fijo (Bs)
- **Descuento**: Cantidad del descuento
- **Período de Vigencia**: Fecha inicio y fin

#### Campos Opcionales:
- **Hora Inicio/Fin**: Horario específico (ej: 07:00 - 11:00)
- **Días de la Semana**: Limitar a días específicos
- **Productos Aplicables**: Seleccionar productos específicos
- **Condiciones**: Términos y condiciones
- **Activa**: Activar/desactivar la promoción
- **Destacada**: Marcar como promoción especial

3. Click en **"Guardar"**

## 🎨 Ejemplos de Promociones

### Ejemplo 1: Happy Hour
```
Título: Happy Hour - Bebidas
Descripción: 30% de descuento en todas las bebidas
Tipo: Porcentaje
Descuento: 30
Vigencia: 01/11/2024 - 31/12/2024
Horario: 15:00 - 18:00
Días: Lunes a Viernes
Activa: Sí
Destacada: No
```

### Ejemplo 2: Combo Desayuno
```
Título: Combo Desayuno Completo
Descripción: Croissant + Café + Jugo Natural
Tipo: Monto Fijo
Descuento: 10 Bs
Vigencia: 01/11/2024 - 30/11/2024
Horario: 07:00 - 10:00
Días: Sábado, Domingo
Activa: Sí
Destacada: Sí
```

### Ejemplo 3: Día del Cliente
```
Título: Día del Cliente - 50% OFF
Descripción: 50% de descuento en todo el menú
Tipo: Porcentaje
Descuento: 50
Vigencia: 15/11/2024 - 15/11/2024
Horario: 00:00 - 23:59
Días: (todos)
Activa: Sí
Destacada: Sí
```

## 🔧 API Endpoints

### Para Administradores

```javascript
// Obtener todas las promociones
GET /api/promociones

// Obtener una promoción
GET /api/promociones/:id

// Crear promoción
POST /api/promociones
Body: {
  titulo: string,
  descripcion: string,
  descuento: number,
  tipoDescuento: 'porcentaje' | 'monto_fijo',
  fechaInicio: Date,
  fechaFin: Date,
  activa: boolean,
  destacada: boolean,
  horaInicio: string,
  horaFin: string,
  diasSemana: string[],
  productos: ObjectId[],
  condiciones: string
}

// Actualizar promoción
PUT /api/promociones/:id

// Eliminar promoción
DELETE /api/promociones/:id

// Activar/Desactivar
PATCH /api/promociones/:id/toggle
```

### Para Clientes

```javascript
// Obtener promociones activas/vigentes
GET /api/promociones/activas
```

## 🎯 Validación Automática

El sistema valida automáticamente:

1. **Rango de fechas**: La promoción debe estar dentro del período configurado
2. **Horario**: Si se especifica, debe estar dentro del horario
3. **Día de la semana**: Si se especifica, debe coincidir con el día actual
4. **Estado activo**: La promoción debe estar marcada como activa

Solo las promociones que cumplen **todas** las condiciones se muestran a los clientes.

## 💡 Consejos

### Para Maximizar el Impacto:
- ✅ Usa títulos cortos y atractivos
- ✅ Describe claramente el beneficio
- ✅ Marca como "destacada" las mejores ofertas
- ✅ Configura horarios específicos para happy hours
- ✅ Usa descuentos por porcentaje para productos variables
- ✅ Usa descuentos fijos para combos

### Buenas Prácticas:
- 📅 Planifica promociones con anticipación
- 🔄 Actualiza regularmente las ofertas
- 📊 Desactiva promociones vencidas
- 🎨 Usa promociones destacadas con moderación
- 📝 Incluye condiciones claras

## 🐛 Solución de Problemas

### La promoción no aparece para clientes

Verifica:
1. ✅ Está marcada como "Activa"
2. ✅ Las fechas incluyen el día actual
3. ✅ El horario incluye la hora actual (si está configurado)
4. ✅ El día de la semana coincide (si está configurado)

### Error al guardar promoción

Verifica que:
1. ✅ Todos los campos obligatorios estén completos
2. ✅ El descuento sea un número válido
3. ✅ Las fechas estén en orden correcto (inicio < fin)
4. ✅ El formato de hora sea HH:mm (ej: 09:30)

## 📱 Interfaz de Usuario

### Panel de Admin
- **Tabla**: Lista todas las promociones con estado
- **Filtros**: Por estado (activa/inactiva)
- **Acciones rápidas**: Editar, Activar/Desactivar, Eliminar
- **Indicadores visuales**: Tags de color para estado

### Vista de Cliente
- **Cards atractivas**: Diseño con gradientes
- **Información clara**: Descuento, vigencia, condiciones
- **Destacadas**: Borde dorado y badge especial
- **Responsive**: Optimizado para móvil y desktop

---

**Desarrollado por Altovisual** 🚀
