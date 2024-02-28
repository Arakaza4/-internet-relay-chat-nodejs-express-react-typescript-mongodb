import express from 'express';
import mongoose from 'mongoose';
import utilisateursRouter from './route/utilisateur';
import canauxRouter from './route/canaux';
import messagesRouter from './route/messages';
import contientsRouteur from './route/contient';
import cors from 'cors';
import http from 'http';
import initializeSocket from './sockets';
import { Server as SocketIOServer } from 'socket.io'; 

const app = express();
const port = 5000;
const server = http.createServer(app); // Créez le serveur HTTP avec votre application Express
const io = new SocketIOServer(server);

app.use(cors());
// Middleware pour gérer les en-têtes CORS

// Middleware pour analyser les corps des requêtes en JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://dbIRC:dbIRCpassword@cluster0.k7igwdj.mongodb.net/?retryWrites=true&w=majority');

// Utilisation des routeurs pour les différentes parties de l'application
app.use('/utilisateurs', utilisateursRouter);
app.use('/canal', canauxRouter);
app.use('/message', messagesRouter);
app.use('/contient', contientsRouteur);

module.exports = {
  io: io
};

// Démarrage du serveur
server.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

// Initialiser les sockets
initializeSocket(server);
