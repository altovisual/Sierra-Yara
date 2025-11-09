# 💱 Sistema de Tasa BCV - Sierra Yara

## 🎯 Descripción
Sistema completo para gestionar la tasa de cambio BCV (Bolívar/Dólar) con actualización automática y manual.

---

## 🚀 Instalación

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

Esto instalará:
- `axios` - Para llamadas HTTP a APIs externas
- `node-cron` - Para programar actualizaciones automáticas

### 2. Inicializar Tasa
```bash
npm run init-tasa
```

Esto creará la primera tasa en la base de datos, obtenida automáticamente de la API.

---

## 📡 API Endpoints

### **GET** `/api/tasa-bcv/actual`
Obtiene la tasa actual activa.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "valor": 36.50,
    "fuente": "api",
    "actualizadoPor": "sistema",
    "activa": true,
    "createdAt": "2025-11-09T18:00:00.000Z"
  }
}
```

### **GET** `/api/tasa-bcv/historico?limite=30`
Obtiene el histórico de tasas.

**Parámetros:**
- `limite` (opcional): Número de registros (default: 30)

### **POST** `/api/tasa-bcv/actualizar`
Actualiza la tasa manualmente (Admin).

**Body:**
```json
{
  "valor": 37.25,
  "actualizadoPor": "Admin Juan",
  "notas": "Ajuste manual por cambio oficial"
}
```

### **POST** `/api/tasa-bcv/actualizar-api`
Fuerza actualización desde API externa (Admin).

### **GET** `/api/tasa-bcv/estadisticas?dias=30`
Obtiene estadísticas de las tasas.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "promedio": "36.75",
    "minima": "36.20",
    "maxima": "37.50",
    "actual": "36.50",
    "cambioTotal": "+2.5%",
    "cantidadActualizaciones": 120
  }
}
```

---

## ⏰ Actualización Automática

### Configuración del Cron Job
El sistema actualiza la tasa automáticamente cada 6 horas:
- 🌅 6:00 AM
- 🌞 12:00 PM
- 🌆 6:00 PM
- 🌙 12:00 AM

### Fuentes de Datos (en orden de prioridad):
1. **PyDolarVe** - `https://pydolarve.org/api/v1/dollar?page=bcv`
2. **ExchangeRate-API** (fallback) - `https://api.exchangerate-api.com/v4/latest/USD`

### Logs del Servidor:
```
⏰ Cron job configurado: Actualización de tasa BCV cada 6 horas
🔄 Actualizando tasa BCV automáticamente...
✅ Tasa BCV actualizada: 36.50
```

---

## 🔧 Uso en el Frontend

### 1. Importar el servicio
```javascript
import tasaBCVAPI from '../services/tasaBCVAPI';
import { formatearPrecioDual } from '../utils/helpers';
```

### 2. Obtener tasa actual
```javascript
const obtenerTasa = async () => {
  const response = await tasaBCVAPI.obtenerTasaActual();
  const tasa = response.data.data.valor;
  console.log('Tasa BCV:', tasa);
};
```

### 3. Mostrar precios duales
```javascript
const producto = {
  nombre: "Propela",
  precioUSD: 0.50
};

const tasa = 36.50;
const precios = formatearPrecioDual(producto.precioUSD, tasa);

console.log(precios.usd);      // "$0.50"
console.log(precios.bs);       // "Bs.S 18,25"
console.log(precios.valorUSD); // 0.50
console.log(precios.valorBs);  // 18.25
```

### 4. Componente de Ejemplo
```jsx
import React, { useState, useEffect } from 'react';
import tasaBCVAPI from '../services/tasaBCVAPI';
import { formatearPrecioDual } from '../utils/helpers';

const ProductoCard = ({ producto }) => {
  const [tasa, setTasa] = useState(36.50);

  useEffect(() => {
    const cargarTasa = async () => {
      const response = await tasaBCVAPI.obtenerTasaActual();
      setTasa(response.data.data.valor);
    };
    cargarTasa();
  }, []);

  const precios = formatearPrecioDual(producto.precioUSD, tasa);

  return (
    <div className="producto-card">
      <h3>{producto.nombre}</h3>
      <div className="precios">
        <span className="precio-usd">{precios.usd}</span>
        <span className="precio-bs">{precios.bs}</span>
      </div>
      <small>Tasa BCV: Bs. {tasa.toFixed(2)}</small>
    </div>
  );
};
```

---

## 🛠️ Funciones Helper

### `convertirUSDaBs(precioUSD, tasaBCV)`
Convierte un precio en USD a Bolívares.

```javascript
const precioBs = convertirUSDaBs(0.50, 36.50);
// Resultado: 18.25
```

### `formatearPrecioDual(precioUSD, tasaBCV)`
Formatea un precio mostrando USD y Bs.

```javascript
const precios = formatearPrecioDual(0.50, 36.50);
// Resultado: {
//   usd: "$0.50",
//   bs: "Bs.S 18,25",
//   valorUSD: 0.50,
//   valorBs: 18.25
// }
```

---

## 📊 Panel de Administración

### Características:
- ✅ Ver tasa actual
- ✅ Ver última actualización
- ✅ Actualizar manualmente
- ✅ Ver histórico de cambios
- ✅ Ver estadísticas (promedio, mín, máx)
- ✅ Forzar actualización desde API

### Ejemplo de UI:
```
┌─────────────────────────────────────────┐
│ 💱 Gestión de Tasa BCV                  │
├─────────────────────────────────────────┤
│ Tasa Actual: Bs. 36.50                  │
│ Última actualización: Hoy 12:00 PM      │
│ Fuente: API (Automática)                │
│ Cambio hoy: +0.5%                       │
│                                         │
│ [Actualizar desde API]                  │
│                                         │
│ Actualización Manual:                   │
│ Nueva tasa: [______] Bs.                │
│ Notas: [___________________]            │
│ [Guardar]                               │
│                                         │
│ Estadísticas (últimos 30 días):         │
│ • Promedio: Bs. 36.75                   │
│ • Mínima: Bs. 36.20                     │
│ • Máxima: Bs. 37.50                     │
│ • Cambio total: +2.5%                   │
└─────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Datos

```javascript
{
  _id: ObjectId,
  valor: Number,           // Ej: 36.50
  fuente: String,          // 'api' o 'manual'
  actualizadoPor: String,  // 'sistema' o nombre del admin
  notas: String,           // Opcional
  activa: Boolean,         // Solo una tasa puede estar activa
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔍 Debugging

### Ver tasa en consola del navegador:
```javascript
fetch('https://sierra-yara.onrender.com/api/tasa-bcv/actual')
  .then(res => res.json())
  .then(data => console.log('Tasa:', data.data.valor));
```

### Logs del servidor:
```bash
# Ver logs en tiempo real
npm run dev

# Buscar logs de tasa
grep "Tasa BCV" logs.txt
```

---

## ⚠️ Consideraciones

1. **Caché**: La tasa se actualiza cada 6 horas, no en cada request
2. **Fallback**: Si la API falla, se usa la última tasa guardada
3. **Histórico**: Se guarda cada cambio para auditoría
4. **Precisión**: Los precios se redondean a 2 decimales
5. **Timezone**: Todas las fechas están en UTC

---

## 🚨 Solución de Problemas

### La tasa no se actualiza
```bash
# Verificar que el cron job esté corriendo
npm run dev
# Buscar: "⏰ Cron job configurado"

# Forzar actualización manual
curl -X POST https://sierra-yara.onrender.com/api/tasa-bcv/actualizar-api
```

### Error al obtener de API
```bash
# Verificar conectividad
curl https://pydolarve.org/api/v1/dollar?page=bcv

# Si falla, actualizar manualmente
curl -X POST https://sierra-yara.onrender.com/api/tasa-bcv/actualizar \
  -H "Content-Type: application/json" \
  -d '{"valor": 36.50, "actualizadoPor": "Admin"}'
```

---

## 📝 Próximas Mejoras

- [ ] Notificaciones push cuando la tasa cambia >5%
- [ ] Gráfico de evolución de la tasa
- [ ] Predicción de tendencia
- [ ] Múltiples monedas (EUR, COP, etc.)
- [ ] API webhook para notificar cambios

---

## 📄 Licencia
MIT - Sierra Yara Café
