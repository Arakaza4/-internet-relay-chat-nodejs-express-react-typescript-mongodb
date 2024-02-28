import React from "react";

// react-router-dom
import { NavigateFunction, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer/Footer';
import FormPseudo from "../components/Form/FormPseudo/FormPseudo";

import { Container } from "react-bootstrap";

import { Toaster, toast } from 'sonner';

import Tools from '../utils/Tools';

function LogGuest() {

    const navigate: NavigateFunction = useNavigate();

    const onValidationReceived = (success: number, action: string, item: any) => {
        if (success === 1)
        {
            // creation d'un cookie pour stocker le name de l'user
            const user: string = JSON.stringify({Pseudo: item.Pseudo});
            Tools.setCookie('user', user);

            // redirection la page d'acceuil
            navigate('/index');
            window.location.reload();
        }
        else
        {
            toast.error('Erreur, ce pseudo est déjà utilisé', {
                position: 'top-right',
                style: {
                    background: 'red',
                    color: 'white'
                },
                duration: 3000
            });
        }
    };

    return (
        <div id="container">
            <div className="runningBox">
                <Toaster />
                <Container>
                    <div className="h-100 d-flex align-items-center justify-content-center">
                        <FormPseudo onValidationReceived={onValidationReceived}/>
                    </div>
                </Container>
            </div>
            <Footer />
        </div>
    )
}

export default LogGuest;