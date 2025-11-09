require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const connectDB = require('./config/database');
const TasaBCV = require('./models/TasaBCV');
const axios = require('axios');

// Importar rutas
const productosRoutes = require('./routes/productos');
const mesasRoutes = require('./routes/mesas');
const pedidosRoutes = require('./routes/pedidos');
const promocionesRoutes = require('./routes/promociones');
const tasaBCVRoutes = require('./routes/tasaBCV');

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
app.use('/api/productos', productosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/tasa-bcv', tasaBCVRoutes);

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
╚═══════════════════════════════════════════════╝
  `);
  
  // Actualizar tasa al iniciar el servidor
  actualizarTasaBCVAuto();
});

module.exports = { app, server, io };
