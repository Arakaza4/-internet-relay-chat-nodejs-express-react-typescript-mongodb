import React, { useState } from 'react';

import style from './ChatCard.module.css';

import { User } from '../../utils/Constants';
import Tools from '../../utils/Tools';

interface ChatCardProps {
    idUtilisateur: number | undefined;
    dateHeure: Date;
    contenu: string;
}

const Chat = (props: ChatCardProps) => {

    const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')) : null;

    const [isMyChat, setIsMyChat] = useState(false);
    if (user !== null && user._id && props.idUtilisateur !== user._id)
    {
        setIsMyChat(true);
    }

    let head = "";
    if (user !== null && !isMyChat)
    {
        // header
        head = user.Pseudo;
    }

    return (
        <div className={style.chatCard}>
            <div className={isMyChat ? style.iSendIt : style.iDont}>
                <span className={style.header}>
                    {
                        head !== "" ? head + " - " + props.dateHeure.toISOString() : props.dateHeure.toISOString()
                    }
                </span>
                <span className={style.content}>
                    {props.contenu}
                </span>
            </div>
        </div>
    );
}

export default Chat;