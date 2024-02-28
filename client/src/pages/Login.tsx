import React from "react";

// react-router-dom
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { Container } from "react-bootstrap";

import Footer from '../components/Footer/Footer';
import FormLogin from "../components/Form/FormLogin/FormLogin";

import Tools from '../utils/Tools';

import { Toaster, toast } from 'sonner';

function Login()
{
    const navigate: NavigateFunction = useNavigate();

    const onValidationReceived = (success: number, action: string, item: Object) => {
        if (success === 1)
        {
            // creation cookie user
            const user: string = JSON.stringify(item);
            Tools.setCookie('user', user);

            // redirection vers la page d'acceuil
            navigate('/index');
            window.location.reload();
        }
        else
        {
            toast.error('Pseudo ou Mot de passe incorrect!', {
                position: 'top-right',
                style: {
                    background: 'red',
                    color: 'white'
                },
                duration: 3000
            });
        }
    }

    return (
        <div id="container">
            <div className="runningBox">
                <Container>
                    <Toaster />
                    <div className="h-100 d-flex align-items-center justify-content-center">
                        <FormLogin onValidationReceived={onValidationReceived} />
                    </div>
                </Container>
            </div>
            <Footer />
        </div>
    )
}

export default Login;