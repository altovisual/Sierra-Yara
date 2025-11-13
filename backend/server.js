require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const TasaBCV = require('./models/TasaBCV');
const axios = require('axios');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productos');
const mesasRoutes = require('./routes/mesas');
const pedidosRoutes = require('./routes/pedidos');
const promocionesRoutes = require('./routes/promociones');
const tasaBCVRoutes = require('./routes/tasaBCV');
const reporteRoutes = require('./routes/reporteRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*', // Permitir origen configurado o todos para desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Permitir origen configurado o todos para desarrollo
  credentials: true
}));
// Aumentar límite para imágenes en base64 (10MB)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Hacer io accesible en las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas de la API
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/tasa-bcv', tasaBCVRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/clientes', clienteRoutes);

// Ruta para obtener información de pago
app.get('/api/config/pago', (req, res) => {
  res.json({
    success: true,
    data: {
      pagoMovil: {
        ci: process.env.PAGO_MOVIL_CI,
        telefono: process.env.PAGO_MOVIL_TELEFONO,
        banco: process.env.PAGO_MOVIL_BANCO
      },
      transferencia: {
        banco: process.env.TRANSFERENCIA_BANCO,
        cuenta: process.env.TRANSFERENCIA_CUENTA,
        titular: process.env.TRANSFERENCIA_TITULAR,
        rif: process.env.TRANSFERENCIA_RIF
      },
      zelle: {
        email: process.env.ZELLE_EMAIL
      },
      paypal: {
        email: process.env.PAYPAL_EMAIL
      }
    }
  });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sierra Yara API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de prueba para emitir evento de mesa liberada
app.post('/api/test/liberar-mesa/:numeroMesa', (req, res) => {
  const numeroMesa = parseInt(req.params.numeroMesa);
  console.log(`🧪 TEST: Emitiendo evento mesa-liberada para mesa ${numeroMesa}`);
  console.log(`📡 Sala: mesa_${numeroMesa}`);
  
  req.io.to(`mesa_${numeroMesa}`).emit('mesa-liberada', {
    numeroMesa,
    mensaje: 'TEST: La mesa ha sido liberada'
  });
  
  res.json({
    success: true,
    message: `Evento emitido a mesa_${numeroMesa}`,
    numeroMesa
  });
});

// Manejo de WebSockets
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  // Unirse a una sala de mesa específica
  socket.on('unirse_mesa', (numeroMesa) => {
    socket.join(`mesa_${numeroMesa}`);
    console.log(`📍 Cliente ${socket.id} se unió a la mesa ${numeroMesa}`);
  });

  // Notificar nuevo pedido
  socket.on('nuevo_pedido', (data) => {
    // Notificar a todos los dispositivos en la mesa
    io.to(`mesa_${data.numeroMesa}`).emit('pedido_actualizado', data);
    
    // Notificar al panel de administración
    io.emit('pedido_nuevo_admin', data);
    
    console.log(`🍽️  Nuevo pedido en mesa ${data.numeroMesa}`);
  });

  // Actualizar estado de pedido
  socket.on('actualizar_estado_pedido', (data) => {
    // Notificar a la mesa
    io.to(`mesa_${data.numeroMesa}`).emit('estado_pedido_actualizado', data);
    
    console.log(`📊 Estado de pedido actualizado: ${data.estado}`);
  });

  // Solicitar mesonero
  socket.on('llamar_mesonero', (data) => {
    io.emit('mesonero_solicitado', data);
    console.log(`🔔 Mesonero solicitado en mesa ${data.numeroMesa}`);
  });

  // Actualizar cuenta de mesa
  socket.on('actualizar_cuenta', (data) => {
    io.to(`mesa_${data.numeroMesa}`).emit('cuenta_actualizada', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Función para actualizar tasa BCV automáticamente
const actualizarTasaBCVAuto = async () => {
  try {
    console.log('🔄 Actualizando tasa BCV automáticamente...');
    
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Sierra-Yara-Cafe/1.0'
      }
    });
    
    if (response.data && response.data.rates && response.data.rates.VES) {
      const tasaObtenida = parseFloat(response.data.rates.VES);
      
      if (tasaObtenida > 0) {
        await TasaBCV.actualizarTasa(tasaObtenida, 'api', 'sistema', 'Actualización automática');
        console.log('✅ Tasa BCV actualizada:', tasaObtenida);
      }
    }
  } catch (error) {
    console.error('❌ Error al actualizar tasa BCV:', error.message);
    console.log('ℹ️  Se usará la última tasa guardada');
  }
};

// Programar actualización de tasa BCV cada 6 horas (a las 6am, 12pm, 6pm, 12am)
cron.schedule('0 6,12,18,0 * * *', actualizarTasaBCVAuto);
console.log('⏰ Cron job configurado: Actualización de tasa BCV cada 6 horas');

// Función para mantener MongoDB activa (evitar que entre en sleep mode)
const keepMongoDBAlive = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Hacer ping a la base de datos
      await mongoose.connection.db.admin().ping();
      console.log('🏓 Ping a MongoDB - Base de datos activa');
    }
  } catch (error) {
    console.error('❌ Error en keep-alive de MongoDB:', error.message);
  }
};

// Programar keep-alive cada 5 minutos para evitar que MongoDB entre en sleep mode
cron.schedule('*/5 * * * *', keepMongoDBAlive);
console.log('⏰ Cron job configurado: Keep-alive de MongoDB cada 5 minutos');

// Función para mantener Render activo (evitar que entre en sleep mode)
const keepRenderAlive = async () => {
  try {
    const https = require('https');
    const http = require('http');
    
    // URL de tu servidor en Render (cambiar si es necesario)
    const renderUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
    
    if (renderUrl) {
      const protocol = renderUrl.startsWith('https') ? https : http;
      const url = new URL(renderUrl + '/api/health');
      
      protocol.get(url, (res) => {
        console.log('🔄 Keep-alive Render - Status:', res.statusCode);
      }).on('error', (err) => {
        console.log('ℹ️  Keep-alive Render (local mode)');
      });
    } else {
      console.log('ℹ️  Keep-alive Render (modo local - sin URL externa)');
    }
  } catch (error) {
    console.log('ℹ️  Keep-alive Render (modo desarrollo)');
  }
};

// Programar keep-alive de Render cada 10 minutos
cron.schedule('*/10 * * * *', keepRenderAlive);
console.log('⏰ Cron job configurado: Keep-alive de Render cada 10 minutos');

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  console.error('Stack:', error.stack);
  // No cerrar el proceso, solo registrar el error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.error('Promise:', promise);
  // No cerrar el proceso, solo registrar el error
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🏔️  Sierra Yara Café - Sistema de Menú    ║
║   🚀 Servidor corriendo en puerto ${PORT}      ║
║   📡 WebSocket habilitado                     ║
║   🌐 Acceso local: http://192.168.1.105:${PORT}  ║
║   💱 Actualización automática de tasa BCV     ║
║   🏓 Keep-alive de MongoDB cada 5 minutos     ║
║   🔄 Keep-alive de Render cada 10 minutos     ║
╚═══════════════════════════════════════════════╝
  `);
  
  // Actualizar tasa al iniciar el servidor
  actualizarTasaBCVAuto();
  
  // Ejecutar primer keep-alive de MongoDB inmediatamente
  setTimeout(keepMongoDBAlive, 5000);
  
  // Ejecutar primer keep-alive de Render después de 1 minuto
  setTimeout(keepRenderAlive, 60000);
});

module.exports = { app, server, io };
