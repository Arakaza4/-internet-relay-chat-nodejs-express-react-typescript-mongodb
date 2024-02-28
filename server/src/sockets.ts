import { Server as SocketIOServer } from 'socket.io'; 

export default function initializeSocket(server: any) {
  const io = new SocketIOServer(server);

  io.on('connection', (socket) => {
      console.log('Un utilisateur s\'est connecté');

      // Gérer la réception des messages envoyés par les clients
      socket.on('sendMessage', (message) => {
          console.log('Message reçu:', message);
          // Émettre le message à tous les clients connectés
          io.emit('message', message);
      });

      // Gérer la déconnexion des clients
      socket.on('disconnect', () => {
          console.log('Un utilisateur s\'est déconnecté');
      });
  });

  return io;
}
