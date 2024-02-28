import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const router = express.Router();

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://dbIRC:dbIRCpassword@cluster0.k7igwdj.mongodb.net/?retryWrites=true&w=majority', {});

  
// Contient
  const schemaContient = new mongoose.Schema({
    idCanal: { type: mongoose.Schema.Types.ObjectId, ref: 'Canal' },
    idMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    idUtilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }
  });

// Modèle basé sur le schéma
const modelContient = mongoose.model('Contient', schemaContient);

export {modelContient};

// Utilisation de body-parser pour analyser le corps des requêtes
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Routes :

// Inserer un message dans un canal
router.post('/inserer-msg_canal', async (req, res) => {
    try {
     
      const nouvelleDonnee = new modelContient({
        idCanal: req.body.idCanal,
        idUtilisateur: req.body.idUtilisateur,
        idMessage: req.body.idMessage
      });
  
      // Enregistrez l'instance dans la base de données
      const donneesInseres = await nouvelleDonnee.save();
      
      res.status(201).json({ message: 'Données insérées avec succès', data: donneesInseres, success:1 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de l\'insertion des données', success:0  });
    }
  });

  export default router;