import { Server as SocketIOServer } from 'socket.io';

let io = null;

export function initRealtimeServer(httpServer, allowedOrigins = []) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins && allowedOrigins.length ? allowedOrigins : '*',
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client temps réel connecté:', socket.id);
    socket.on('disconnect', (reason) => {
      console.log('🔌 Client déconnecté:', socket.id, '-', reason);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Realtime server not initialized');
  return io;
}

export function publishEvent(event, payload) {
  try {
    if (!io) return;
    io.emit(event, payload);
  } catch (err) {
    console.warn('[Realtime] publishEvent error:', err?.message || err);
  }
}

export default { initRealtimeServer, getIO, publishEvent };