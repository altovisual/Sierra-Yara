# 🏓 Keep-Alive de MongoDB

## ¿Qué es?

Sistema automático que mantiene la conexión con MongoDB activa para evitar que entre en "sleep mode" (modo de suspensión).

## ¿Por qué es necesario?

### Problema:
- **MongoDB Atlas (versión gratuita)** entra en sleep mode después de ~30 minutos de inactividad
- Cuando se "despierta", el primer request puede tardar 10-30 segundos
- Esto puede interrumpir el servicio en medio de una operación

### Solución:
- Sistema de **ping automático cada 5 minutos**
- Mantiene la base de datos siempre activa
- Sin interrupciones durante el servicio

## Funcionamiento

### Implementación en `server.js`:

```javascript
// Función para mantener MongoDB activa
const keepMongoDBAlive = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Ping a MongoDB - Base de datos activa');
    }
  } catch (error) {
    console.error('❌ Error en keep-alive de MongoDB:', error.message);
  }
};

// Ejecutar cada 5 minutos
cron.schedule('*/5 * * * *', keepMongoDBAlive);
```

### Características:

✅ **Ping cada 5 minutos** - Mantiene la conexión activa  
✅ **Automático** - No requiere intervención manual  
✅ **Seguro** - Verifica el estado de conexión antes de hacer ping  
✅ **Logging** - Muestra en consola cada ping exitoso  
✅ **Manejo de errores** - Captura y registra errores sin detener el servidor  

## Logs en Consola

Al iniciar el servidor verás:
```
⏰ Cron job configurado: Keep-alive de MongoDB cada 5 minutos
```

Cada 5 minutos verás:
```
🏓 Ping a MongoDB - Base de datos activa
```

## Beneficios

### Para el Restaurante:
- ✅ **Sin interrupciones** durante el servicio
- ✅ **Respuesta rápida** en todo momento
- ✅ **Experiencia fluida** para clientes y meseros
- ✅ **No se pierden pedidos** por timeout de base de datos

### Técnicos:
- ✅ Evita el cold start de MongoDB Atlas
- ✅ Mantiene conexión persistente
- ✅ Reduce latencia en operaciones
- ✅ Compatible con MongoDB Atlas Free Tier

## Alternativas

Si el keep-alive no es suficiente, considera:

### 1. MongoDB Atlas Paid (M10+)
- **Costo:** ~$57/mes
- **Beneficios:** Sin sleep mode, mejor rendimiento
- **Recomendado para:** Producción con alto tráfico

### 2. MongoDB Local
- **Costo:** Gratis
- **Beneficios:** Control total, sin límites
- **Requiere:** Servidor propio o VPS

### 3. Otras opciones en la nube
- **Railway:** MongoDB gratis sin sleep
- **DigitalOcean:** Managed MongoDB desde $15/mes
- **AWS DocumentDB:** Compatible con MongoDB

## Monitoreo

Para verificar que funciona correctamente:

1. **Revisar logs del servidor** - Debe aparecer el ping cada 5 minutos
2. **Probar en horas de baja actividad** - La DB debe responder rápido
3. **Monitorear tiempos de respuesta** - Deben ser consistentes

## Configuración Avanzada

### Cambiar frecuencia del ping:

```javascript
// Cada 3 minutos
cron.schedule('*/3 * * * *', keepMongoDBAlive);

// Cada 10 minutos
cron.schedule('*/10 * * * *', keepMongoDBAlive);
```

### Deshabilitar keep-alive:

Comentar o eliminar estas líneas en `server.js`:
```javascript
// cron.schedule('*/5 * * * *', keepMongoDBAlive);
// console.log('⏰ Cron job configurado: Keep-alive de MongoDB cada 5 minutos');
```

## Notas Importantes

⚠️ **MongoDB Atlas Free Tier:**
- Límite de 500 conexiones simultáneas
- El keep-alive usa 1 conexión cada 5 minutos
- Impacto mínimo en el límite de conexiones

✅ **Recomendación:**
- Mantener el keep-alive activado en producción
- Especialmente importante en horarios de servicio
- Combinar con monitoreo de uptime

## Soporte

Si experimentas problemas:
1. Verificar logs del servidor
2. Revisar estado de MongoDB Atlas
3. Comprobar conectividad de red
4. Verificar credenciales en `.env`
