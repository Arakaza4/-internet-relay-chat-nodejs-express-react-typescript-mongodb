import React, { useState } from "react";

// react-router-dom
import { Link } from 'react-router-dom';

// style
import style from './FormPseudo.module.css';

// bootstrap
import { Form, Button } from 'react-bootstrap';

import AxiosTools from '../../../utils/Axios';

interface FormPseudoProps {
    onValidationReceived: (success: number, type: string, item: any) => void;
}

function FormPseudo(props: FormPseudoProps)
{
    const [validated, setValidated] = useState<boolean>(false);
    
    const [pseudo, setPseudo] = useState<string>('');

    const handlePseudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPseudo(e.target.value);
    };

    function handlePseudoSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // verification
        const form:any = e.currentTarget;
        if (form.checkValidity() === false)
        {
            e.stopPropagation();
        }

        setValidated(true);

        if (pseudo)
        {
            // envoie post connexion
            AxiosTools.get(`utilisateurs/verifier_pseudo-unique/${pseudo}`, (response: any) =>
            {
                console.log(response);
                if (response.data.success === 1)
                {
                    // reussite

                    // toast reussite
                    props.onValidationReceived(1, 'connexion_guest', { Pseudo : pseudo })
                }
                else
                {
                    // echec de la connexion

                    // toast echec
                    props.onValidationReceived(0, 'connexion_guest', null)
                }
            })
        }
    }

    return (
        <div className={style.formPseudo}>
            <h1>
                Qui es-tu ?
            </h1>
            <Form noValidate validated={validated} onSubmit={handlePseudoSubmit}>
                <Form.Group className="my-3">
                    <Form.Control
                        type="pseudo"
                        placeholder="pseudo"
                        value={pseudo}
                        onChange={handlePseudoChange}
                        required
                    />
                </Form.Group>
                <div className="BtnW">
                    <Button
                        type='submit'
                        variant='primary'
                        className='w-100 mb-3'
                    >
                        Valider
                    </Button>
                    <div className={style.linkUp}>
                        <Link to="/login">Se connecter</Link>
                        <Link to="/register">Créer un compte</Link>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default FormPseudo