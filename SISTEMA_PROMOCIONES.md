# 🎯 Sistema de Promociones - Guía Completa

## 📋 Tipos de Promociones

El sistema ahora soporta **dos tipos** de promociones:

### 1. **Promociones con Productos Específicos** 🛒
Promociones que incluyen productos concretos que se agregan al carrito con descuento.

**Ejemplo**: "2x1 en Cafés" - Incluye 3 cafés específicos con 50% de descuento

**Funcionamiento**:
- El cliente ve los productos incluidos en la promoción
- Al hacer click en "Agregar al Carrito", los productos se agregan automáticamente con el precio con descuento
- Los productos aparecen en el carrito con el nombre de la promoción
- Se redirige automáticamente al carrito

### 2. **Promociones de Descuento General** 💰
Promociones que aplican un descuento a todo el pedido.

**Ejemplo**: "20% de descuento en todo" - Aplica 20% a cualquier producto que agregues

**Funcionamiento**:
- No tiene productos específicos asociados
- Al hacer click en "Aplicar Descuento", se guarda la promoción
- El cliente agrega productos normalmente del menú
- El descuento se aplica automáticamente en el carrito
- Se muestra el subtotal y el total con descuento

## 🚀 Crear Promociones con Productos

### Paso 1: Ejecutar el Seed

```bash
cd backend
npm run seed:promos-productos
```

Esto creará:
- ✅ **2x1 en Cafés** (con 3 cafés específicos)
- ✅ **Combo Batidos** (con 2 batidos específicos)
- ✅ **Combo Dulce** (con postres + café)
- ✅ **Descuento General 20%** (sin productos, descuento general)

### Paso 2: Ver las Promociones

1. Ve a `http://localhost:3000/promociones`
2. Verás las 4 promociones creadas
3. Las que tienen productos mostrarán botón **"Agregar al Carrito"**
4. Las de descuento general mostrarán **"Aplicar Descuento"**

## 📝 Crear Promoción Manualmente

### Promoción con Productos Específicos

```javascript
{
  titulo: "Combo Desayuno",
  descripcion: "Croissant + Café Americano",
  descuento: 30,
  tipoDescuento: "porcentaje",
  fechaInicio: new Date(),
  fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  activa: true,
  destacada: true,
  productos: ["ID_CROISSANT", "ID_CAFE"], // IDs de productos
  condiciones: "Válido de 7am a 11am"
}
```

### Promoción de Descuento General

```javascript
{
  titulo: "Happy Hour",
  descripcion: "15% en todo el menú",
  descuento: 15,
  tipoDescuento: "porcentaje",
  fechaInicio: new Date(),
  fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  activa: true,
  destacada: false,
  productos: [], // Sin productos = descuento general
  condiciones: "De 3pm a 6pm"
}
```

## 🎨 Flujo del Cliente

### Opción A: Promoción con Productos

1. **Ver Promociones** → `/promociones`
2. **Seleccionar promoción** → Ej: "2x1 en Cafés"
3. **Click "Agregar al Carrito"** → Los productos se agregan automáticamente
4. **Ir al Carrito** → Ver productos con descuento aplicado
5. **Confirmar Pedido** → Listo!

### Opción B: Descuento General

1. **Ver Promociones** → `/promociones`
2. **Seleccionar promoción** → Ej: "20% en todo"
3. **Click "Aplicar Descuento"** → Se guarda la promoción
4. **Ir al Menú** → Agregar productos normalmente
5. **Ir al Carrito** → Ver descuento aplicado al total
6. **Confirmar Pedido** → Listo!

## 💡 Características Visuales

### En la Página de Promociones

- **Con Productos**:
  - Muestra lista de productos incluidos
  - Botón azul/naranja "Agregar al Carrito" 🛒
  - Al hacer click, redirige al carrito

- **Sin Productos (Descuento General)**:
  - No muestra productos
  - Botón "Aplicar Descuento" 🏷️
  - Botón verde con ✓ cuando está aplicada
  - Al hacer click, redirige al menú

### En el Carrito

- **Con Productos**:
  ```
  ☕ Café Americano (2x1 en Cafés)
  Precio: Bs. 7.00 (antes Bs. 10.00)
  ```

- **Con Descuento General**:
  ```
  🎉 Descuento General 20%
  Descuento 20%: -Bs. 15.00
  
  Subtotal: Bs. 75.00
  Total: Bs. 60.00
  ```

## 🔧 API

### Obtener Promociones Activas

```javascript
GET /api/promociones/activas

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "titulo": "2x1 en Cafés",
      "descuento": 50,
      "tipoDescuento": "porcentaje",
      "productos": [
        {
          "_id": "...",
          "nombre": "Café Americano",
          "precio": 10,
          "imagenUrl": "..."
        }
      ]
    }
  ]
}
```

## 📊 Ventajas del Sistema

### Para el Negocio:
- ✅ Promociones flexibles (con productos o descuento general)
- ✅ Control total sobre qué productos incluir
- ✅ Fácil gestión desde el panel admin
- ✅ Promociones destacadas para mayor visibilidad

### Para el Cliente:
- ✅ Proceso simple y rápido
- ✅ Visualización clara del descuento
- ✅ Productos con promoción ya con precio rebajado
- ✅ Descuentos automáticos en el carrito

## 🎯 Casos de Uso

### Caso 1: Combo de Desayuno
```
Promoción: "Desayuno Completo"
Productos: Croissant + Café Americano
Descuento: 5 Bs de descuento fijo
Resultado: Cliente paga Bs. 15 en vez de Bs. 20
```

### Caso 2: Happy Hour
```
Promoción: "Happy Hour 30%"
Productos: Todos los batidos
Descuento: 30% en cada batido
Resultado: Batido de Bs. 15 → Bs. 10.50
```

### Caso 3: Día del Cliente
```
Promoción: "Día del Cliente - 20% OFF"
Productos: Ninguno (descuento general)
Descuento: 20% en todo el pedido
Resultado: Pedido de Bs. 100 → Bs. 80
```

## 🐛 Solución de Problemas

### No veo productos en la promoción
- Verifica que la promoción tenga productos asociados en la BD
- Ejecuta `npm run seed:promos-productos` para crear promociones con productos

### El descuento no se aplica
- Verifica que la promoción esté activa
- Revisa que las fechas y horarios sean correctos
- Asegúrate de haber aplicado la promoción antes de agregar productos

### Los productos no se agregan al carrito
- Verifica que los productos existan en la base de datos
- Revisa la consola del navegador para ver errores
- Asegúrate de que el backend esté corriendo

---

**Desarrollado por Altovisual** 🚀
