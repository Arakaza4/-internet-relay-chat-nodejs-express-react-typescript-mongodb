import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {modelContient} from './contient';
import moment from 'moment';

const router = express.Router();

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://dbIRC:dbIRCpassword@cluster0.k7igwdj.mongodb.net/?retryWrites=true&w=majority', {});

// Schémas collections
// Users 
const userSchema = new mongoose.Schema({
  Nom: String,
  Prenom: String,
  DateNaissance: {
    type: Date,
    get: function (val: moment.MomentInput) {
      return moment(val).format('MM/DD/YYYY');
    }
  },
  Pseudo: String,
  MotDePasse: String
});

// Modèle basé sur le schéma
const modelUser = mongoose.model('Utilisateur', userSchema);

export {modelUser};

// Crypt
const bcrypt = require('bcryptjs');

// Utilisation de body-parser pour analyser le corps des requêtes
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Insérer un utilisateur
router.post('/inserer', async (req, res) => {
  const pseudo = req.body.Pseudo;

  try {
    const utilisateur = await modelUser.findOne({ Pseudo: pseudo });

    if (utilisateur) {
      return res.status(401).json({ message: "Utilisateur déjà existant", data: pseudo, success:0 });
    }

    const motDePasseHash = await bcrypt.hash(req.body.MotDePasse, 10);

    // Création d'une instance du modèle avec les données de la requête
    const nouvelleDonnee = new modelUser({
      Nom: req.body.Nom,
      Prenom: req.body.Prenom,
      DateNaissance: req.body.DateNaissance,
      Pseudo: pseudo,
      MotDePasse: motDePasseHash
    });

    // Enregistrez l'instance dans la base de données
    const donneesInseres = await nouvelleDonnee.save();

    return res.status(201).json({ message: 'Données insérées avec succès', data: donneesInseres, success: 1 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de l\'insertion des données' });
  }
});


// Supprimer un user
router.delete('/supprimer/:id', async (req, res) => {
   const userId = req.params.id;

   try {
     // Supprimer l'utilisateur en fonction de son ID
     const resultatSuppression = await modelUser.findByIdAndDelete(userId);

     if (resultatSuppression) {
       res.status(200).json({ message: 'Utilisateur supprimé avec succès', data: resultatSuppression, success:1 });
     } else {
       res.status(404).json({ message: 'Aucun utilisateur trouvé avec l\'ID spécifié', success:0 });
     }
   } catch (error) {
     console.error(error);
     res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
   }
});

// Modifier une information d'un user
router.put('/modifier/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Modifier l'utilisateur en fonction de son ID
    const resultatModification = await modelUser.findByIdAndUpdate(userId, req.body, { new: true });

    if (resultatModification) {
      res.status(200).json({ message: 'Modification de l\'utilisateur avec succès', data: resultatModification, success:1 });
    } else {
      res.status(404).json({ message: 'Aucun utilisateur trouvé avec l\'ID spécifié', success:0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'utilisateur' });
  }
});

// Obtenir la liste de tous les users
router.get('/lires', async (req, res) => {
  try {
    // Récupérer tous les utilisateurs depuis la base de données
    const utilisateurs = await modelUser.find();

    res.status(200).json({ message: 'Liste des utilisateurs récupérée avec succès', data: utilisateurs, success:1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', success:0 });
  }
});

// Obtenir les détails d'un user à partir de l'id
router.get('/lire/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Récupérer l'utilisateur en fonction de son ID depuis la base de données
    const utilisateur = await modelUser.findById(userId);

    if (utilisateur) {
      res.status(200).json({ message: 'Utilisateur récupéré avec succès', data: utilisateur, success:1 });
    } else {
      res.status(404).json({ message: 'Aucun utilisateur trouvé avec l\'ID spécifié', success:0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});


// Lister les users d'un canal
router.get('/canal/:idCanal', async (req, res) => {
  const idCanal = req.params.idCanal;

  try {
    // Recherche des enregistrements dans la table "Contient" pour le canal spécifié
    const contientRecords = await modelContient.find({ idCanal });

    // Obtenetion les ID des utilisateurs associés à ce canal à partir des enregistrements de Contient
    const utilisateursIDs = contientRecords.map(record => record.idUtilisateur);

    // Utilisation les ID pour récupérer les détails des utilisateurs depuis la table "Utilisateurs"
    const utilisateurs = await modelUser.find({ _id: { $in: utilisateursIDs } });

    res.status(200).json({ message: 'Utilisateurs du canal récupérés avec succès', data: utilisateurs, success:1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs du canal', success:0 });
  }
});

// Route pour vérifier la connexion d'un utilisateur 
router.post('/verif_connexion', async (req, res) => {
  const Pseudo = req.body.Pseudo;
  const mdp_user = req.body.MotDePasse;

  try {
    const utilisateur = await modelUser.findOne({ Pseudo: Pseudo });

    if (!utilisateur) {
      return res.status(404).json({ message: "L'utilisateur n'existe pas", success: 0 });
    }

    if (!bcrypt.compareSync(mdp_user, utilisateur.MotDePasse)) {
      return res.status(401).json({ message: "Mot de passe non valide", success: 0 });
    }

    const { Nom, Prenom, DateNaissance, _id } = utilisateur;

    return res.status(200).json({ message: "Mot de passe valide", data: {Nom, Prenom, DateNaissance, _id, Pseudo}, success: 1 });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Erreur serveur");
  }
});

// Route pour verifier si le pseudo est unique 
router.get('/verifier_pseudo-unique/:pseudo', async (req, res) => {
  try {
    const pseudo = req.params.pseudo;
    
    // Recherche de l'utilisateur avec le pseudo spécifié
    const utilisateur = await modelUser.findOne({ Pseudo: pseudo });
    
    if (utilisateur) {
      res.status(201).json({ message: "Le pseudo est déjà existant", success: 0}); 
    } else {
      res.status(200).json({ message: "Le pseudo n'est pas existant", success: 1}); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la vérification de l'unicité du pseudo" });
  }
});

export default router;

