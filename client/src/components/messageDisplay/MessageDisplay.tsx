import React, { useState } from 'react';
import { ListGroup, InputGroup, FormControl, Button, Dropdown, Modal } from 'react-bootstrap';

import ChatCard from '../ChatCard/ChatCard';

import Axios from '../../utils/Axios';
import { User } from '../../utils/Constants';
import Tools from '../../utils/Tools';

import './MessageDisplay.css';

interface modelCanal {
  _id: number;
  NomCanal: string;
  Prive: boolean;
}

interface modelMessage {
  _id: number;
  dateHeure: Date;
  Contenu: any;
}

interface modelUtilisateur {
  Nom: string;
  Prenom: string;
  DateNaissance: Date;
  Pseudo: string;
}

interface MessageDisplayProps {
  channelName: string;
  messages: modelMessage[];
  displayUsers: (item: modelUtilisateur[]) => void;
  onReceiveChannels: (channels: modelCanal[]) => void;
  messageOnEvent: (success: number, message: string) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = (props: MessageDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newChannelName, setNewChannelName] = useState(props.channelName);
  const [inputMessage, setInputMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')) : null;

  // Fonction pour gérer le clic sur le renommage du canal
  const handleRenameClick = () => {
    setIsEditing(true);
  };

  // Fonction pour gérer le clic sur la suppression du canal
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // Fonction pour confirmer la suppression du canal
  const handleConfirmDelete = () => {
    // Requête DELETE pour supprimer le canal
    Axios.delete(`canal/supprimer/${props.channelName}`, (response: any) => {
      if (response.status === 200) {
        // Afficher le message de succès
        setShowSuccessMessage(true);
        console.log("Le canal a été supprimé avec succès !");
      } else {
        // Afficher une erreur en cas d'échec
        console.error("Une erreur s'est produite lors de la suppression du canal.");
      }
    });

    // Masquer le modal de suppression et l'édition du nom du canal
    setShowDeleteModal(false);
    setIsEditing(false);
  };

  // Fonction pour sauvegarder le renommage du canal
  const handleSaveRename = () => {
    // Requête PUT pour modifier le nom du canal
    Axios.put(`canal/modifier/${props.channelName}`, { NomCanal: newChannelName }, (response: any) => {
      if (response.status === 200) {
        // Afficher le message de succès
        setShowSuccessMessage(true);
        console.log("Le canal a été renommé avec succès !");
      } else {
        // Afficher une erreur en cas d'échec
        console.error("Une erreur s'est produite lors du renommage du canal.");
      }
    });

    // Mettre fin à l'édition du nom du canal
    setIsEditing(false);
  };

  // Fonction pour gérer le changement de nom du canal
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewChannelName(event.target.value);
  };

  // Fonction pour gérer le changement de message saisi
  const handleInputMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  // Fonction pour basculer la visibilité du canal
  const togglePrivacy = () => {
    setIsPrivate(!isPrivate);

    // Requête PUT pour modifier la visibilité du canal
    Axios.put(`canal/${props.channelName}/privacy`, { isPrivate: !isPrivate }, (response: any) => {
      if (response.status === 200) {
        console.log("La visibilité du canal a été modifiée avec succès !");
      } else {
        console.error("Une erreur s'est produite lors de la modification de la visibilité du canal.");
      }
    });
  };

  // envoie de message
  const handleSendMessange = () => {
    Axios.post('message/inserer', {Contenu: inputMessage}, () => {
      // recharger la conversation
    });
  }

  // Fonction pour gérer les commandes de recherche
  const handleCommand = (command: string, arg: string) => {

    // on recupere l'id du canal ou on est
    let idCanal = JSON.parse(Tools.getCookie('currentChannel'))._id;

    switch (command)
    {
      case '/users':
        // on recupere les utilisateurs de ce canal
        Axios.get(`utilisateurs/canal/${idCanal}`, (response: any) => {
          props.displayUsers(response.data.data);
        });
        break;
      case '/nick':
        if (arg) {
          // Axios.post<any>('canal/inserer', { });
        }
        break;
      case '/msg':
        // cree un channel prive et y ajouter la personne ciblee
        if (user)
        {
          interface Postdata {
            idUtilisateur: number | undefined;
            NomCanal: string;
            recepteur: string;
            message: string;
          }

          const postData: Postdata = {
            idUtilisateur: user._id,
            NomCanal: `Discussion ${user.Pseudo}, ${arg.split(' ')[0]}`,
            recepteur: arg.split(' ')[0],
            message: arg.split(' ')[1]
          }

          Axios.post(`canal/discussion/${idCanal}`, postData, (response: any) => {
            props.messageOnEvent(response.data.success, response.data.message);

            if (user)
            {
              // Rafraîchir la liste des canaux après la création
              Axios.get(`canal/utilisateurs/${user._id}`, (response: any) => {
                props.onReceiveChannels(response.data.data);
              });

              // on modifier le cookie pour mettre celui de la conversation
             //  Tools.setCookie("currentChannel", JSON.stringify(response.data.data.canal));

              // window.location.reload();
            }
          });
        }
        break;
      default:
        break;
    }
  };

  // Rendu du composant MessageDisplay
  return (
    <div className="message-display">
      <div className="channel-options">
        <h2 onClick={handleRenameClick}>{props.channelName}</h2>
        <Dropdown>
          <Dropdown.Toggle variant="light" id="dropdown-options">
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleRenameClick}>Renommer le channel</Dropdown.Item>
            <Dropdown.Item onClick={handleDeleteClick}>Supprimer le channel</Dropdown.Item>
            <Dropdown.Item onClick={togglePrivacy}>
              {isPrivate ? 'Passer en mode public' : 'Passer en mode privé'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        {isEditing ? (
          <div>
            <FormControl
              placeholder="Nouveau nom du channel..."
              aria-label="Nouveau nom"
              value={newChannelName}
              onChange={handleInputChange}
              className="mt-3"
              style={{ width: '60%', marginRight: 'auto' }}
            />
            <Button variant="primary" onClick={handleSaveRename}>Valider</Button>
          </div>
        ) : null}
      </div>

      <div className="message-container">
        <ListGroup>
          {
            (props.messages.length > 0) ? (
              props.messages.map((message, index) => (
                <ChatCard key={index} idUtilisateur={user ? user._id : undefined} contenu={message.Contenu} dateHeure={message.dateHeure} />
              ))
            ) : null
          }
        </ListGroup>
      </div>

      <div className="message-input">
        <div>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Tapez votre message ici..."
              aria-label="Message"
              value={inputMessage}
              onChange={handleInputMessageChange}
            />
            <Button variant="primary" onClick={() => {
              if (inputMessage.startsWith('/')) {

                // on split searchQuery pour recuperer la commande et les args
                let command: string = inputMessage.split(' ')[0];
                let arg: string | string[] = inputMessage.substring(command.length).trim();

                handleCommand(command, arg);
              } else {
                handleSendMessange();
              }
            }}>
              Envoyer
            </Button>
          </InputGroup>
        </div>
      </div>
      
      {/* Affichage du succès de l'opération */}
      <Modal show={showSuccessMessage} onHide={() => setShowSuccessMessage(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Opération réussie</Modal.Title>
        </Modal.Header>
        <Modal.Body>L'opération a été effectuée avec succès.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessMessage(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation de la suppression du canal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer le channel "{props.channelName}" ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MessageDisplay;
