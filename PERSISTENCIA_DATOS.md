# 📦 Persistencia de Datos - Sierra Yara

## 🎯 Objetivo
Mantener la sesión del usuario y sus datos incluso después de cerrar el navegador.

---

## 💾 Datos Persistidos en localStorage

### 1. **Sesión de Mesa** (`sesionMesa`)
```javascript
{
  mesa: {
    _id: "690fb2c0658eef57e1711cf4",
    numeroMesa: 1,
    estado: "ocupada",
    totalMesa: 10.50,
    dispositivosActivos: [...],
    pedidos: [...]
  },
  dispositivoId: "abc123-def456",
  nombreUsuario: "Juan"
}
```

**Cuándo se guarda:**
- Al conectarse a una mesa (escanear QR o ingresar número)
- Al actualizar datos de la mesa

**Cuándo se elimina:**
- Al desconectarse manualmente
- Al hacer logout

---

### 2. **Carrito de Compras** (`carrito`)
```javascript
[
  {
    productoId: "673f2d41...",
    nombre: "Propela",
    precio: 0.45,
    imagenUrl: "https://...",
    cantidad: 2,
    personalizaciones: {
      "Tamaño": "Grande",
      "Extra": "Sin azúcar"
    }
  },
  ...
]
```

**Cuándo se guarda:**
- Al agregar un producto
- Al actualizar cantidad
- Al eliminar un producto
- Al aplicar/quitar promoción

**Cuándo se elimina:**
- Al confirmar el pedido
- Al limpiar el carrito manualmente

---

### 3. **Promoción Aplicada** (`promocion`)
```javascript
{
  _id: "673f2d41...",
  nombre: "Descuento 20%",
  tipoDescuento: "porcentaje",
  descuento: 20,
  activa: true
}
```

**Cuándo se guarda:**
- Al aplicar una promoción

**Cuándo se elimina:**
- Al quitar la promoción
- Al confirmar el pedido

---

### 4. **Favoritos** (`favoritos`)
```javascript
[
  "673f2d41...",  // IDs de productos favoritos
  "673f2d42...",
  "673f2d43..."
]
```

**Cuándo se guarda:**
- Al marcar/desmarcar un producto como favorito

**Cuándo se elimina:**
- Al limpiar favoritos manualmente

---

## 🔄 Flujo de Restauración

### Al Abrir la App:

```
1. Usuario abre sierra-yara.vercel.app
   ↓
2. MesaContext carga datos de localStorage
   ↓
3. ¿Hay sesión guardada?
   ├─ SÍ → Restaura mesa, dispositivo, nombre
   │        Reconecta socket
   │        Redirige a /menu
   │
   └─ NO → Muestra pantalla "Escanear QR"
```

### En el Menú:

```
1. CarritoContext carga carrito guardado
   ↓
2. FavoritosContext carga favoritos guardados
   ↓
3. Usuario ve su carrito y favoritos intactos
```

---

## 🧪 Cómo Probar

### Test 1: Persistencia de Sesión
1. ✅ Escanea QR y conéctate a mesa 1
2. ✅ Cierra el navegador completamente
3. ✅ Abre el navegador
4. ✅ Ve a sierra-yara.vercel.app
5. ✅ **Resultado:** Deberías estar en el menú de mesa 1

### Test 2: Persistencia de Carrito
1. ✅ Agrega 3 productos al carrito
2. ✅ Cierra el navegador
3. ✅ Abre el navegador
4. ✅ Ve a sierra-yara.vercel.app
5. ✅ **Resultado:** Los 3 productos siguen en el carrito

### Test 3: Persistencia de Favoritos
1. ✅ Marca 5 productos como favoritos
2. ✅ Cierra el navegador
3. ✅ Abre el navegador
4. ✅ Ve a sierra-yara.vercel.app
5. ✅ **Resultado:** Los 5 productos siguen marcados

### Test 4: Persistencia de Promoción
1. ✅ Aplica un código de promoción
2. ✅ Cierra el navegador
3. ✅ Abre el navegador
4. ✅ Ve a sierra-yara.vercel.app
5. ✅ **Resultado:** La promoción sigue aplicada

---

## 🔍 Logs de Debug

### En la Consola del Navegador:

```javascript
// Al cargar la app
📦 Datos guardados en localStorage: {...}
✅ Restaurando sesión de mesa: 1
🛒 Cargando carrito desde localStorage...
✅ Carrito restaurado: 3 items
✅ Promoción restaurada: {...}
⭐ Cargando favoritos desde localStorage...
✅ Favoritos restaurados: 5 productos
```

---

## 🛠️ Comandos Útiles

### Ver datos en localStorage (Consola del navegador):
```javascript
// Ver sesión de mesa
console.log(JSON.parse(localStorage.getItem('sesionMesa')));

// Ver carrito
console.log(JSON.parse(localStorage.getItem('carrito')));

// Ver favoritos
console.log(JSON.parse(localStorage.getItem('favoritos')));

// Ver promoción
console.log(JSON.parse(localStorage.getItem('promocion')));
```

### Limpiar todo localStorage:
```javascript
localStorage.clear();
location.reload();
```

---

## ⚠️ Limitaciones

1. **Tamaño:** localStorage tiene un límite de ~5-10MB
2. **Seguridad:** Los datos NO están encriptados
3. **Sincronización:** Los datos NO se sincronizan entre dispositivos
4. **Navegador:** Cada navegador tiene su propio localStorage

---

## 🎉 Beneficios

✅ **Experiencia fluida:** El usuario no pierde su progreso
✅ **Menos fricción:** No necesita volver a escanear QR
✅ **Carrito persistente:** No pierde items agregados
✅ **Favoritos guardados:** Acceso rápido a productos preferidos
✅ **Offline-first:** Funciona incluso sin conexión (hasta cierto punto)

---

## 📝 Notas Técnicas

- Los datos se guardan en formato JSON
- Se validan antes de restaurar
- Se limpian automáticamente al desconectar
- Los pedidos confirmados se obtienen del servidor (no se guardan en localStorage)
