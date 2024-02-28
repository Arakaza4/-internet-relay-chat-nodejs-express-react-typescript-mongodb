import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {modelContient} from './contient';
import {modelUser} from './utilisateur';
import {modelMessage} from './messages';

const router = express.Router();

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://dbIRC:dbIRCpassword@cluster0.k7igwdj.mongodb.net/?retryWrites=true&w=majority', {});

// Schémas collections
// Canal 
const canalSchema = new mongoose.Schema({
  NomCanal: String,
  Prive: Boolean,
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  }
});
  
// Modèle basé sur le schéma
const modelCanal = mongoose.model('Canal', canalSchema);

export {modelCanal};

// Utilisation de body-parser pour analyser le corps des requêtes
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Routes :

// Inserer un canal
router.post('/inserer', async (req, res) => {
  try {
    // Création d'une instance du modèle Canal avec les données de la requête
    const nouvelleDonneeCanal = new modelCanal({
      NomCanal: req.body.NomCanal,
      Prive: req.body.Prive,
      idUtilisateur: req.body.idUtilisateur
    });

    // Enregistrez l'instance du canal dans la base de données
    const canalInseres = await nouvelleDonneeCanal.save();

    // Création d'une instance du modèle Contient
    const nouvelleDonneeContient = new modelContient({
      idCanal: canalInseres._id, // Utilisation de l'ID du canal inséré
      idUtilisateur: req.body.idUtilisateur
    });

    // Enregistrez l'instance de Contient dans la base de données
    const contientInseres = await nouvelleDonneeContient.save();

    res.status(201).json({ message: 'Données insérées avec succès', data: { canal: canalInseres, contient: contientInseres, success:1 } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'insertion des données', success:0 });
  }
});

// Inserer un user dans un canal
router.post('/inserer-user', async (req, res) => {
  try {
   
    const nouvelleDonnee = new modelContient({
      idCanal: req.body.idCanal,
      idUtilisateur: req.body.idUtilisateur,
    });

    // Enregistrez l'instance dans la base de données
    const donneesInseres = await nouvelleDonnee.save();

    res.status(201).json({ message: 'Données insérées avec succès', data: donneesInseres, success:1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'insertion des données', success:0 });
  }
});

// Route pour créer un canal et ajouter des utilisateurs avec des pseudonymes
router.post('/discussion/:idCanal', async (req, res) => {
  try {

    // Créer un nouveau canal avec les données fournies
    const nouveauCanal = new modelCanal({
      idUtilisateur: req.body.idUtilisateur,
      NomCanal: req.body.NomCanal, // Nom du canal, si fourni, sinon par défaut 'Discussion'
      Prive: true, // Indiquer si le canal est privé
    });

    // Enregistrer le canal dans la base de données
    const canalInseres = await nouveauCanal.save();

    // Création d'une instance du modèle Contient
    const nouvelleDonneeContient = new modelContient({
      idCanal: canalInseres._id, // Utilisation de l'ID du canal inséré
      idUtilisateur: req.body.idUtilisateur
    });

    // ajouter le createur du canal dans le canal
    const contientInseres = await nouvelleDonneeContient.save();

    // on ajoute le recepteur dans le canal
    const recepteur = req.body.recepteur;

    // Rechercher l'utilisateur dans la base de données en fonction du pseudonyme
    const utilisateurExistant = await modelUser.findOne({ Pseudo: recepteur });

    // Vérifier si l'utilisateur existe
    if (!utilisateurExistant) {
      // Gérer le cas où l'utilisateur n'existe pas
      return res.status(204).json({ message: `Utilisateur avec le pseudo ${recepteur} non trouvé dans la base de données`, success: 0});
    }

    // verifier que l'utilisateur etait dans le canal de base
    const utilisateursDansCanal = await modelContient.find({ idCanal: req.params.idCanal, idUtilisateur: utilisateurExistant._id, idMessage: { $in: [null, undefined] } }).select('idUtilisateur');

    if (utilisateursDansCanal.length == 1)
    {
      // Ajouter l'utilisateur au canal
      const nouvelleDonneeContient = new modelContient({
        idCanal: canalInseres._id,
        idUtilisateur: utilisateurExistant._id
      });
      await nouvelleDonneeContient.save(); // Enregistrer la relation entre l'utilisateur et le canal
    }

    // Récupérer le contenu du message depuis le corps de la requête
    const message = req.body.message;

    /* Envoyer le message (stocker + socket) */
    // Création d'une instance du modèle avec les données de la requête
    const nouvelleDonnee = new modelMessage({
      Contenu: req.body.Contenu
    });

    // Enregistrez l'instance dans la base de données
    const donneesInseres = await nouvelleDonnee.save();


    res.status(201).json({ message: 'Discussion démarrée avec succès', data: { canal: canalInseres }, success: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de la discussion', success: 0 });
  }
});

// Supprimer un canal
router.delete('/supprimer/:id', async (req, res) => {
   const canalId = req.params.id;

    try {
      // Supprimer le canal en fonction de son ID
      const resultatSuppression = await modelCanal.findByIdAndDelete(canalId);
    
      if (resultatSuppression) {
        res.json({ message: 'Canal supprimé avec succès', data: resultatSuppression, success:1  });
      } else {
        res.status(404).json({ message: 'Aucun canal trouvé avec l\'ID spécifié', success:0 });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la suppression du canal' });
    }
});

// Supprimer un canal d'un utilisateur
router.delete('/supprimer/:idUtilisateur/:NomCanal', async (req, res) => {
  const idUtilisateur = req.params.idUtilisateur;
  const nomCanal = req.params.NomCanal;

  try {
    // Supprime le canal de l'utilisateur avec l'ID donné et le nom du canal donné
    const resultatSuppression = await modelCanal.findOneAndDelete({
      idUtilisateur: idUtilisateur,
      NomCanal: nomCanal
    });

    if (!resultatSuppression) {
      return res.status(404).json({ message: "Le canal n'a pas été trouvé ou n'appartient pas à cet utilisateur.", success: 0});
    }

    res.status(200).json({ message: 'Le canal a été supprimé avec succès.', success: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression du canal.', success: 0 });
  }
});

// Route pour supprimer un utilisateur d'un canal si l'idMessage est vide
router.delete('/utilisateurs/:idUtilisateur/:idCanal', async (req, res) => {
  try {
    // Vérifier si l'utilisateur a reçu des messages dans ce canal
    const aRecuDesMessages = await modelContient.exists({ idUtilisateur: req.params.idUtilisateur, idCanal: req.params.idCanal, idMessage: { $exists: true } });

    // Supprimer l'utilisateur du canal
    await modelContient.deleteOne({ idUtilisateur: req.params.idUtilisateur, idCanal: req.params.idCanal });

    // Retourner un message de succès
    res.status(200).json({ message: "L'utilisateur a été supprimé du canal avec succès", success: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur du canal", success: 0 });
  }
});

// Route pour supprimer un utilisateur d'un canal en fonction du nom du canal
router.delete('/quit/:idUtilisateur/:NomCanal', async (req, res) => {
  try {
    const idUtilisateur = req.params.idUtilisateur;
    const nomCanal = req.params.NomCanal;

    // on recupere le canal correspondant a ce NomCanal
    const canal = await modelCanal.findOne({ NomCanal: nomCanal });

    // Vérifier si le canal existe
    if (!canal) {
      return res.status(404).json({ message: "Canal non trouvé." });
    }

    // Supprimer l'utilisateur du canal
    const result = await modelContient.deleteOne({ idUtilisateur: idUtilisateur, idCanal: canal._id, idMessage: { $in: [null, undefined] } });

    // Vérifier si un objet a été supprimé
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "L'utilisateur n'appartient pas à ce canal.", success: 0 });
    }

    // Retourner un message de succès
    res.status(200).json({ message: "L'utilisateur a été supprimé du canal avec succès", success: 1 });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur du canal", success: 0 });
  }
});


// Modifier un canal
router.put('/modifier/:id', async (req, res) => {
  const canalId = req.params.id;

  try {
    // Modifier le canal en fonction de son ID
    const resultatModification = await modelCanal.findByIdAndUpdate(canalId, req.body, { new: true });

    if (resultatModification) {
      res.json({ message: 'Modification du canal avec succès', data: resultatModification, success:1  });
    } else {
      res.status(404).json({ message: 'Aucun canal trouvé avec l\'ID spécifié', success:0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification du canal' });
  }
});

// Lire l'ensemble des canaux
router.get('/lires', async (req, res) => {
  try {
    // Récupérer tous les canaux depuis la base de données
    const canaux = await modelCanal.find();

    res.status(200).json({ message: 'Liste des canaux récupérée avec succès', data: canaux, success:1  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des canaux', success:0 });
  }
});

// Lire un canal
router.get('/lire/:idCanal', async (req, res) => {
  const canalId = req.params.idCanal;

  try {
    // Récupérer l'utilisateur en fonction de son ID depuis la base de données
    const canal = await modelCanal.findById(canalId);

    if (canal) {
      res.status(200).json({ message: 'Canal récupéré avec succès', data: canal, success:1 });
    } else {
      res.status(404).json({ message: 'Aucun canal trouvé avec l\'ID spécifié', success:0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération du canal' });
  }
});

// Route pour rechercher des canaux par nom partiel
router.get('/rechercher/:partieNomCanal', async (req, res) => {
  const partieNomCanal = req.params.partieNomCanal;

  try {
    // Recherche des canaux dont le nom contient la partie spécifiée
    const canaux = await modelCanal.find({ NomCanal: { $regex: partieNomCanal, $options: 'i' } });

    if (canaux.length > 0) {
      res.status(200).json({ message: 'Canaux récupérés avec succès', data: canaux, success:1 });
    } else {
      res.status(204).json({ message: 'Aucun canal trouvé avec le nom spécifié' });
    }
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: 'Erreur lors de la récupération des canaux' });
  }
});

// Route pour lister les canaux d'un utilisateur n'ayant jamais reçu de message
router.get('/utilisateurs/:idUtilisateur', async (req, res) => {
  try {
    // Vérifier si l'utilisateur a reçu des messages
    const aRecuDesMessages = await modelContient.exists({ idUtilisateur: req.params.idUtilisateur, idMessage: { $exists: true } });

    // Si l'utilisateur a reçu des messages, retourner une réponse indiquant qu'il n'a pas de canaux
    if (aRecuDesMessages) {
      return res.status(200).json({ message: "L'utilisateur a reçu des messages et n'a pas de canaux", success:1  });
    }

    // Si l'utilisateur n'a pas reçu de messages, rechercher les canaux associés à cet utilisateur
    const canaux = await modelContient.find({ idUtilisateur: req.params.idUtilisateur }).select('idCanal');
    
     // Récupérer les détails des canaux à partir du modèle modelCanal
     const detailsCanaux = await Promise.all(canaux.map(async (canal) => {
      const canalDetails = await modelCanal.findById(canal.idCanal).select('NomCanal Prive');
      return canalDetails;
    }));

    // Retourner la liste des identifiants des canaux associés à l'utilisateur
    res.status(200).json({ message: "Canaux de l'utilisateur n'ayant jamais reçu de message récupérés", data: detailsCanaux, success:1  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des canaux de l'utilisateur", success:0 });
  }
});

const { io } = require('../app');

// Route pour ajouter un utilisateur à un canal
router.post('/ajouter-utilisateur/:idCanal', async (req, res) => {
  try {
    const { idUtilisateur } = req.body;

    // Vérifier si l'utilisateur est déjà dans le canal
    const utilisateurDansCanal = await modelContient.findOne({ idCanal: req.params.idCanal, idUtilisateur });

    if (utilisateurDansCanal) {
      return res.status(400).json({ message: "L'utilisateur est déjà dans le canal", success: 0 });
    }

    // Ajouter l'utilisateur au canal
    await modelContient.create({ idCanal: req.params.idCanal, idUtilisateur });

    // Récupérer les détails de l'utilisateur
    const utilisateur = await modelUser.findById(idUtilisateur);

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé", success: 0 });
    }

    // Émettre un événement de notification à tous les utilisateurs du canal
    io.to(req.params.idCanal).emit('L\'utilisateur', { message: `${utilisateur.Nom} a rejoint le canal`});

    // Retourner un message de succès
    res.status(200).json({ message: "Notification envoyé avec succès", success: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur", success: 0 });
  }
});

// Route pour rejoindre des canaux par nom
router.post('/join/:NomCanal', async (req, res) => {
  const NomCanal = req.params.NomCanal;

  const { idUtilisateur } = req.body;

  try {
    // Recherche des canaux
    const canal = await modelCanal.findOne({ NomCanal: { $regex: NomCanal, $options: 'i' } });

    if (!canal) {
      return res.status(404).json({ message: "Canal non trouvé", success: 0 });
    }

    // Vérifier si l'utilisateur est déjà dans le canal
    const utilisateurDansCanal = await modelContient.findOne({ idCanal: canal._id, idUtilisateur: idUtilisateur });

    if (utilisateurDansCanal) {
      return res.status(400).json({ message: "L'utilisateur est déjà dans le canal", success: 0 });
    }

    // Ajouter l'utilisateur au canal
    await modelContient.create({ idCanal: canal._id, idUtilisateur });

    // Récupérer les détails de l'utilisateur
    const utilisateur = await modelUser.findById(idUtilisateur);

    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé", success: 0 });
    }

    // Émettre un événement de notification à tous les utilisateurs du canal
    // io.to(canal._id).emit('L\'utilisateur', { message: `${utilisateur.Nom} a rejoint le canal`});

    // Retourner un message de succès
    res.status(200).json({ message: "Notification envoyé avec succès", success: 1 });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur", success: 0 });
  }
});

export default router;

