import React, { useState, useEffect } from "react";
import '../pages/styles/Display.css'


/* components */
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Plus from '../components/Plus/Plus';

/* page */
import HomePage from "./HomePage";

// tools
import { User } from '../utils/Constants';
import Tools from '../utils/Tools';

import { Toaster, toast } from 'sonner';

const Display: React.FC = () => {

    const [isToastShown, setIsToastShown] = useState<boolean>(false);
    const [isGuest, setIsGuest] = useState<boolean>(true);

    useEffect(() => {
        if (Tools.getCookie('user') !== undefined && !isToastShown)
        {
            const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')).Pseudo : null;

            if (user !== null)
            {
                if (user._id === undefined) setIsGuest(true);
                else setIsGuest(false);

                toast(`Bienvenue à toi ${user}!`, {
                    position: 'top-right',
                    duration: 1500
                });
                setIsToastShown(true);
            }
        }
    }, [isToastShown]);


    const onCreateChannel = (success: number, action: string, item: Object) => {
        if (success === 1)
        {
            toast.success('Canal créé avec succès!', {
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
            toast.error('Erreur dans la creation du canal!', {
                position: 'top-right',
                style: {
                    background: 'red',
                    color: 'white'
                },
                duration: 3000,
            });
        }
    }

    return (
        <div id="container">
            <Header />
            <div className="runningBox">
                <Toaster />
                <div className="homepage-container">
                    <div className="homepage-content">
                        <HomePage />
                        <Plus displayPlus={isGuest} onCreateChannel={onCreateChannel}/>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
  };
  
  export default Display;
