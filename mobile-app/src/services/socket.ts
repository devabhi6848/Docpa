import { io, Socket } from 'socket.io-client';

export class SocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string = 'http://localhost:3000/heartbeat') {
    this.url = url;
  }

  connect(url?: string) {
    if (url) this.url = url;
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(this.url, {
      query: { 'client-type': 'dashboard' },
      transports: ['websocket'],
      reconnection: true,
    });

    return this.socket;
  }

  subscribeToLogs(projectId: string, onChunk: (chunk: string) => void) {
    if (!this.socket) this.connect();
    this.socket?.emit('subscribe:logs', { projectId });
    this.socket?.on('container:logs:chunk', (data: { projectId: string; chunk: string }) => {
      if (data.projectId === projectId) {
        onChunk(data.chunk);
      }
    });
  }

  unsubscribeFromLogs(projectId: string) {
    this.socket?.emit('unsubscribe:logs', { projectId });
    this.socket?.off('container:logs:chunk');
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
