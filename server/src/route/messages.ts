import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {modelContient} from './contient';
import {modelCanal} from './canaux'
import {modelUser} from './utilisateur'
import { Timestamp } from 'mongodb';


const router = express.Router();

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://dbIRC:dbIRCpassword@cluster0.k7igwdj.mongodb.net/?retryWrites=true&w=majority', {});

// Schémas collections
// Messages
const messageSchema = new mongoose.Schema({
  contenu: String,
  dateHeure: Date
});
  
// Modèle basé sur le schéma
const modelMessage = mongoose.model('Message', messageSchema);

export {modelMessage};

// Utilisation de body-parser pour analyser le corps des requêtes
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// inserer un message
router.post('/inserer', async (req, res) => {
  try {
    // Création d'une instance du modèle avec les données de la requête
    const nouvelleDonnee = new modelMessage({
      Contenu: req.body.Contenu
    });

    // Enregistrez l'instance dans la base de données
    const donneesInseres = await nouvelleDonnee.save();

    res.status(201).json({ message: 'Données insérées avec succès', data: donneesInseres, success:1  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'insertion des données', success:0 });
  }
});

// supprimer un message
router.delete('/supprimer/:id', async (req, res) => {
  const messageId = req.params.id;

     try {
       // Supprimer l'utilisateur en fonction de son ID
       const resultatSuppression = await modelMessage.findByIdAndDelete(messageId);
    
       if (resultatSuppression) {
         res.status(200).json({ message: 'Message supprimé avec succès', data: resultatSuppression, success:1 });
       } else {
         res.status(404).json({ message: 'Aucun message trouvé avec l\'ID spécifié', success:0 });
       }
     } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Erreur lors de la suppression du message' });
     }
});

// Modifier un message
router.put('/modifier/:id', async (req, res) => {
  const messageId = req.params.id;

  try {
    // Modifier le message en fonction de son ID
    const resultatModification = await modelMessage.findByIdAndUpdate(messageId, req.body, { new: true });

    if (resultatModification) {
      res.status(200).json({ message: 'Modification du message avec succès', data: resultatModification, success:1  });
    } else {
      res.status(404).json({ message: 'Aucun message trouvé avec l\'ID spécifié', success:0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification du message' });
  }
});

// lire l'ensemble des messages 
router.get('/lires', async (req, res) => {
  try {
    // Récupérer tous les messages depuis la base de données
    const messages = await modelMessage.find();

    res.status(200).json({ message: 'Liste des messages récupérée avec succès', data: messages, success:1  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', success:0 });
  }
});

// lire un message
router.get('/lire/:id', async (req, res) => {
  const messageId = req.params.id;

  try {
    // Récupérer l'utilisateur en fonction de son ID depuis la base de données
    const messages = await modelMessage.findById(messageId);

    if (messages) {
      res.status(200).json({ message: 'Utilisateur récupéré avec succès', data: messages, success:1  });
    } else {
      res.status(404).json({ message: 'Aucun utilisateur trouvé avec l\'ID spécifié', success:0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Lire tous les messages d'un user
router.get('/users/:idUtilisateur', async (req, res) => {
  const idUtilisateur = req.params.idUtilisateur;

  try {
    // Recherche des enregistrements dans la table "Contient" pour l'utilisateur spécifié
    const contientRecords = await modelContient.find({ idUtilisateur });

    // Obtention des ID des utilisateurs associés à ce canal
    const messagesIDs = contientRecords.map(record => record.idMessage);

    // Utilisation des ID pour récupérer les détails des utilisateurs
    const messages = await modelMessage.find({ _id: { $in: messagesIDs } });

    res.status(200).json({ message: 'Messages de l\'utilisateur récupérés avec succès', data: messages, success:1  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages de l\'utilisateurs', success:0 });
  }
});

// Route pour récupérer tous les messages d'un canal spécifique
router.get('/canaux-user/:idCanal', async (req, res) => {
  try {
    // Recherche des messages associés à un canal spécifique
    const messages = await modelMessage.find({ idCanal: req.params.idCanal });

    // Retourner les messages trouvés
    res.status(200).json({ message: "Messages récupérés avec succès", data: messages, success: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des messages du canal", success: 0 });
  }
});

const { io } = require('../app');

// Route pour l'envoie instantané des messages + notification (sockets)
router.post('/envoyer-message', async (req, res) => {
  const { idCanal } = req.body;
  const message = req.body.message; // Récupérer le contenu du message depuis le corps de la requête

  try {
      // Vérifier si le canal est privé
      const canal = await modelCanal.findById(idCanal);
      if (canal && canal.Prive) {
          // Récupérer tous les utilisateurs du canal
          const utilisateursDansCanal = await modelContient.find({ idCanal });

          // Émettre le message à chaque utilisateur du canal
          utilisateursDansCanal.forEach(async (utilisateur) => {
              const infoUtilisateur = await modelUser.findById(utilisateur.idUtilisateur);
              if (infoUtilisateur) {
                  const nomUtilisateur = infoUtilisateur.Nom;
                  io.to(utilisateur.idUtilisateur).emit('message', message);
                  io.to(utilisateur.idUtilisateur).emit('notification', `${nomUtilisateur} a envoyé un message : ${message}`);
              }
          });

          res.status(200).json({ message: 'Message envoyé avec succès.' });
      } else {
          // Si le canal n'est pas privé, émettre le message à tous les clients connectés
          io.emit('message', message);
          res.status(200).json({ message: 'Message envoyé avec succès.' });
      }
  } catch (error) {
      console.error('Erreur lors de l\'envoi du message : ', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de l\'envoi du message.' });
  }
})

export default router;

