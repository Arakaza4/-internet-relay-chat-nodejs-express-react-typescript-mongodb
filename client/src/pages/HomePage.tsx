import React, { useState, useEffect, useRef } from 'react';

import { Container, Row, Col, ListGroup } from 'react-bootstrap';

import ChannelList from '../components/channelList/ChannelList';
import SearchBar from '../components/searchbar/SearchBar';
import MessageDisplay from '../components/messageDisplay/MessageDisplay';

import Axios from '../utils/Axios';
import Tools from '../utils/Tools';

import '../pages/styles/HomePage.css';

import { Toaster, toast } from 'sonner';

const HomePage: React.FC = () => {

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

  // États pour gérer les données et l'état de l'application
  const [selectedChannel, setSelectedChannel] = useState<modelCanal>();
  const [searchQuery, setSearchQuery] = useState<modelCanal[]>([]);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(window.innerWidth < 768);
  const [channelMessages, setChannelMessages] = useState<modelMessage[]>([]);

  // Gestion du redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // information sur le canal en cours
  const [currentChannel, setCurrentChannel] = useState<modelCanal | null>(null);
  // Mettre à jour l'état du canal si le cookie existe
  useEffect(() => {
    const currentChannelCookie = Tools.getCookie('currentChannel');
    if (currentChannelCookie) {
      setCurrentChannel(JSON.parse(currentChannelCookie));
    }
  }, []);

  // Référence pour stocker le canal actuel
  const currentChannelRef = useRef<modelCanal | null>(null);

  // Utiliser useEffect pour simuler un clic sur le canal lorsque currentChannel change
  useEffect(() => {
    if (currentChannel && currentChannel !== currentChannelRef.current) {
      handleChannelClick(currentChannel);
      currentChannelRef.current = currentChannel;
    }

    console.log(currentChannelRef.current);
  }, [currentChannel]); // Déclencher seulement lorsque currentChannel change

  // Fonction pour gérer le clic sur un canal
  const handleChannelClick = (channel: modelCanal) => {
    // creation du cookie currentChannel
    Tools.setCookie('currentChannel', JSON.stringify(channel));

    setSelectedChannel(channel);

    // Requête GET pour récupérer les messages du canal
    Axios.get(`message/canaux-user/${channel._id}`, (response: any) => {
      const messages = response.data;
      setChannelMessages(messages);
    });
  };

  // Fonction pour gérer la recherche
  const handleSearch = (query: modelCanal[]) => {
    setSearchQuery(query);
  };

  const [channels, setChannels] = useState<modelCanal[]>([]);
  const onReceiveChannels = (channels: modelCanal[]) => {
    // lorsqu'on cree un channel via le raccourci, on recupere tous les channels de l'utilisateur et on l'envoie dans le composant qui map les channels
    setChannels(channels);
  };

  const messageOnEvent = (success: number, message: string) => {
      if (success === 1)
      {
        toast.success(message, {
          position: 'top-right',
          style: {
              background: 'green',
              color: 'white'
          },
          duration: 3000
      });
      }
      else
      {
          toast.error(message, {
              position: 'top-right',
              style: {
                  background: 'red',
                  color: 'white'
              },
              duration: 3000
          });
      }
  };

  const displayUsers = (item: modelUtilisateur[]) => {

    if (currentChannel !== null)
    {
      // listes des utilisateurs du canal en cours
      const userList = item.map(user => user.Pseudo).join('\n');

      toast.message(`Liste des utilisateurs de : ${currentChannel.NomCanal}`, {
        description: userList
      });
    }
  }

  return (
    <Container fluid>
      <Toaster />
      <Row className="homepage-row">
        <Col xs={12} md={4} className={`homepage-sidebar ${isSmallScreen && selectedChannel ? 'hide' : ''}`}>
          <div className={`searchbar ${isSmallScreen && selectedChannel ? 'hide' : ''}`} style={{ position: 'relative', zIndex: 2, padding: '1px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '0px' }}>
            <SearchBar onSearch={handleSearch} onReceiveChannels={onReceiveChannels} messageOnEvent={messageOnEvent}/>
            {
              searchQuery && searchQuery.length > 0 ?
              <ListGroup style={{ boxShadow: '5px 5px 15px 5px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' , borderRadius: '8px' }}>
                  {
                    searchQuery.map((item: modelCanal) =>
                      <ListGroup.Item key={item._id} style={{ borderBottom: '1px solid #eee', padding: '10px 20px' }}>{item.NomCanal}</ListGroup.Item>
                    )
                  }
              </ListGroup>
              : null
            }
          </div>
          <div className={`channel-list ${isSmallScreen && selectedChannel ? 'hide' : ''}`} style={{ position: 'relative', zIndex: 1 }}>
            <ChannelList onChannelClick={handleChannelClick} channels={channels}/>
          </div>
        </Col>
        <Col xs={12} md={8} className={`homepage-content ${!selectedChannel ? 'hide' : ''}`}>
          {selectedChannel ? (
            <MessageDisplay channelName={selectedChannel.NomCanal} messages={channelMessages} displayUsers={displayUsers} messageOnEvent={messageOnEvent} onReceiveChannels={onReceiveChannels}/>
          ) : (
            <div className="select-channel-message">
              <p>Sélectionnez un canal pour à envoyer et recevoir des messages.</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
