import React, { useState } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Axios from '../../utils/Axios';
import { User } from '../../utils/Constants';
import Tools from '../../utils/Tools';

interface modelCanal {
  _id: number;
  NomCanal: string;
  Prive: boolean;
}

interface SearchBarProps {
  onSearch: (query: modelCanal[]) => void;
  onReceiveChannels: (channels: modelCanal[]) => void;
  messageOnEvent: (success: number, message: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = (props: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);

  const handleSearch = () => {
    // Check si la requête de recherche est vide & display un message d'erreur puis arrêter la recherche
    if (searchQuery.trim() === '') {
      props.onSearch([]);
      setShowError(true);
      return;
    }

    // Réinitializ l'état de l'erreur
    setShowError(false);

    // Requête pour faire la recherche
    Axios.get(`canal/rechercher/${searchQuery}`,(response: any) => {
      props.onSearch(response.data.data);
    });
  };

  // Fonction pour gérer les commandes de recherche
  const handleCommand = (command: string, arg: string) => {

    const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')) : null;

    switch (command) {
      case '/list':
        if (arg) {
          Axios.get(`canal/lires`, (response: any) => {

            // on met les arguments sous forme de tableau
            let listCanal: string[] = arg.split(' ');
            for (let i = 0; i < listCanal.length; i++) {
              listCanal[i] = listCanal[i].toLowerCase();
            }

            
            // on boucle sur le resultat pour ne mapper que les channels qui sont dans la liste de l'utilisateur
            let result: modelCanal[] = [];
            for (let canal of response.data.data) {
              if (canal.NomCanal && listCanal.includes(canal.NomCanal.toLowerCase())) {
                result.push(canal);
              }
            }

            // on map les resultats dans les resultats de la searchbar
            props.onSearch(result);
          });
        }
        else {
          Axios.get(`canal/lires`, (response: any) => {
            props.onSearch(response.data.data);
          });
        }
        break;
      case '/create':
        if (arg) {
          const args = arg.split(' ');
          Axios.post<any>('canal/inserer', { idUtilisateur: user !== null ? user._id : undefined, NomCanal: args[0], Prive: args[1] ? (["prive", "private", "lock", "ferme"].includes(args[1].toLowerCase()) ? true : false) : false}, () => {
            if (user !== null)
            {
              // Rafraîchir la liste des canaux après la création
              Axios.get(`canal/utilisateurs/${user._id}`, (response: any) => {
                props.onReceiveChannels(response.data.data);
              });
            }
          });
        }
        break;
      case '/delete':
        if (arg && user)
        {
          Axios.delete(`canal/supprimer/${user._id}/${arg}`, (response: any) => {

            // Afficher le message de succès ou d'erreur
            props.messageOnEvent(response.data.success, response.data.message);

            if (user !== null)
            {
              // Rafraîchir la liste des canaux après la création
              Axios.get(`canal/utilisateurs/${user._id}`, (response: any) => {
                props.onReceiveChannels(response.data.data);
              });
            }
          });
        }
        break;
      case '/join':
        if (arg) {
          Axios.post<any>(`canal/join/${arg}`, { idUtilisateur: user !== null ? user._id : undefined }, (response: any) => {
            // Afficher le message de succès ou d'erreur
            props.messageOnEvent(response.data.success, response.data.message);

            if (user !== null)
            {
              // Rafraîchir la liste des canaux après la création
              Axios.get(`canal/utilisateurs/${user._id}`, (response: any) => {
                props.onReceiveChannels(response.data.data);
              });
            }
          });
        }
        break;
      case '/quit':
        if (arg) {
          if (user) {
            Axios.delete<any>(`canal/quit/${user._id}/${arg}`, (response: any) => {
              // Afficher le message de succès ou d'erreur
              props.messageOnEvent(response.data.success, response.data.message);

              if (user !== null)
              {
                // Rafraîchir la liste des canaux après la création
                Axios.get(`canal/utilisateurs/${user._id}`, (response: any) => {
                  props.onReceiveChannels(response.data.data);
                });
              }
            });
          }
        }
        break;
      default:
        setShowError(true);
        break;
    }
  };

  return (
    <Form className="mt-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Rechercher des channels"
          value={searchQuery}
          onChange={(e) => {
            const newSearchQuery = e.target.value;
            setSearchQuery(newSearchQuery);
            if (newSearchQuery === '') {
              props.onSearch([]);
            }
          }}
        />
        
        <Button variant="primary" onClick={() => {
          if (searchQuery.startsWith('/')) {

            // on split searchQuery pour recuperer la commande et les args
            let command: string = searchQuery.split(' ')[0];
            let arg: string | string[] = searchQuery.substring(command.length).trim();

            handleCommand(command, arg);
          } else {
            handleSearch();
          }
        }}>
          <FontAwesomeIcon icon={faSearch} />
        </Button>

      </InputGroup>
      {showError && <Alert variant="danger" className="mt-2">Veuillez entrer une requête de recherche.</Alert>}
    </Form>
  );
};

export default SearchBar;

