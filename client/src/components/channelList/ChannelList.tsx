import React, { useState, useEffect } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import Axios from '../../utils/Axios';
import './ChannelList.css';
import { User } from '../../utils/Constants';
import Tools from '../../utils/Tools';

interface modelCanal {
  _id: number;
  NomCanal: string;
  Prive: boolean;
}

interface ChannelListProps {
  onChannelClick: (channel: modelCanal) => void;
  channels: modelCanal[];
}

const ChannelList: React.FC<ChannelListProps> = (props: ChannelListProps) => {
  const [userChannels, setUserChannels] = useState<modelCanal[]>([]);

  useEffect(() => {
    const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')) : null;
    
    // La requête GET pour récupérer la liste des channels de l'utilisateur
    if (user !== null) {
      Axios.get(`canal/utilisateurs/${user._id}`, (response: any) => {
        setUserChannels(response.data.data);
      });
  }
  }, []);

  useEffect(() => {
    if (props.channels.length > 0) {
      setUserChannels(props.channels);
    }
  }, [props.channels]);

  return (
    <Card className="mt-2">
      <Card.Body>
        <Card.Title>Channels</Card.Title>
        {userChannels.length === 0 ? (
          <p>Vous n'avez pas encore ajouté de channels.</p>
        ) : (
          <ListGroup>
            {userChannels.map((channel: modelCanal) => (
              channel !== null ? 
              (<ListGroup.Item key={channel._id} action onClick={() => props.onChannelClick(channel)}>
                {channel.NomCanal}
              </ListGroup.Item>) : null
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChannelList;
