import React from "react";

// react-router-dom
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { Container } from "react-bootstrap";

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import FormRegister from "../components/Form/FormRegister/FormRegister";

// style
// import style from './styles/FormHome.module.css';

import { Toaster, toast } from 'sonner';

function Register(props: any) {

    const navigate: NavigateFunction = useNavigate();

    const onValidationReceived = (success: number, action: string, item: Object) => {
        if (success === 1)
        {
            toast.success('Compte créé avec succès!', {
                position: 'top-right',
                style: {
                    background: 'green',
                    color: 'white'
                },
                duration: 3000
            });

            // redirection la page des form
            setTimeout(() => {
                // redirection vers la page des formulaires
                navigate('/form');
                window.location.reload();
            }, 3001);
        }
        else
        {
            toast.error('Erreur dans la creation de compte!', {
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
            <Header />
            <div className="runningBox">
                <Container>
                    <Toaster />
                    <div className="h-100 d-flex align-items-center justify-content-center">
                        <FormRegister onValidationReceived={onValidationReceived} action={props.action}/>
                    </div>
                </Container>
            </div>
            <Footer />
        </div>
    )
}

export default Register;