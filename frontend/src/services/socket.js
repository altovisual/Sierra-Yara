import { io } from 'socket.io-client';

/**
 * Configuración de Socket.io para comunicación en tiempo real
 * Detecta automáticamente si estamos en localhost o en red local
 */
const getSocketUrl = () => {
  // Si hay variable de entorno, usarla
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  
  // Detectar si estamos accediendo desde la red local
  const hostname = window.location.hostname;
  
  // Si el hostname es una IP local (no localhost), usar esa IP para el backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:5000`;
  }
  
  // Por defecto, usar localhost
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Conectar al servidor de WebSocket
  connect() {
    if (this.socket && this.connected) {
      console.log('Socket ya está conectado');
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error);
    });

    return this.socket;
  }

  // Desconectar del servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Unirse a una sala de mesa
  unirseMesa(numeroMesa) {
    if (this.socket && this.connected) {
      this.socket.emit('unirse_mesa', numeroMesa);
      console.log(`📍 Unido a la mesa ${numeroMesa}`);
    }
  }

  // Emitir evento de nuevo pedido
  emitirNuevoPedido(data) {
    if (this.socket && this.connected) {
      this.socket.emit('nuevo_pedido', data);
    }
  }

  // Emitir actualización de estado de pedido
  emitirActualizacionEstado(data) {
    if (this.socket && this.connected) {
      this.socket.emit('actualizar_estado_pedido', data);
    }
  }

  // Llamar al mesonero
  llamarMesonero(data) {
    if (this.socket && this.connected) {
      this.socket.emit('llamar_mesonero', data);
    }
  }

  // Emitir actualización de cuenta
  emitirActualizacionCuenta(data) {
    if (this.socket && this.connected) {
      this.socket.emit('actualizar_cuenta', data);
    }
  }

  // Escuchar evento de pedido actualizado
  onPedidoActualizado(callback) {
    if (this.socket) {
      this.socket.on('pedido_actualizado', callback);
    }
  }

  // Escuchar evento de estado de pedido actualizado
  onEstadoPedidoActualizado(callback) {
    if (this.socket) {
      this.socket.on('estado_pedido_actualizado', callback);
    }
  }

  // Escuchar evento de cuenta actualizada
  onCuentaActualizada(callback) {
    if (this.socket) {
      this.socket.on('cuenta_actualizada', callback);
    }
  }

  // Escuchar evento de nuevo pedido (para admin)
  onNuevoPedidoAdmin(callback) {
    if (this.socket) {
      this.socket.on('pedido_nuevo_admin', callback);
    }
  }

  // Escuchar evento de mesonero solicitado (para admin)
  onMesoneroSolicitado(callback) {
    if (this.socket) {
      this.socket.on('mesonero_solicitado', callback);
    }
  }

  // Escuchar evento de mesa actualizada (para admin)
  onMesaActualizada(callback) {
    if (this.socket) {
      this.socket.on('mesa_actualizada', callback);
    }
  }

  // Remover listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Obtener instancia del socket
  getSocket() {
    return this.socket;
  }

  // Verificar si está conectado
  isConnected() {
    return this.connected;
  }
}

// Exportar instancia única (Singleton)
const socketService = new SocketService();
export default socketService;
