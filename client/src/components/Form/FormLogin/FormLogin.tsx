import React, { useState } from "react";

// react-router-dom
import { Link } from 'react-router-dom';

// style
import style from './FormLogin.module.css';

// bootstrap
import { Form, InputGroup, Button } from 'react-bootstrap';

//fontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// tools
import AxiosTools from '../../../utils/Axios';

interface FormLoginProps {
    onValidationReceived: (success: number, type: string, data: any) => void;
}

const FormLogin = (props: FormLoginProps) => {
    const [validated, setValidated] = useState<boolean>(false);

    const [missingData, setMissingData] = useState<boolean>(false);

    const [pseudo, setPseudo] = useState<string>('');
    const [motDePasse, setMotDePasse] = useState<string>('');

    const handlePseudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPseudo(e.target.value);
    };

    const handleMotDePasseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMotDePasse(e.target.value);
    };

    // visibilite du mot de passe
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();

        // verification
        const form:any = e.currentTarget;
        if (form.checkValidity() === false)
        {
            e.stopPropagation();
        }

        setValidated(true);

        interface PostData {
            Pseudo: string;
            MotDePasse: string;
        }

        const postData: PostData = {
            Pseudo: pseudo,
            MotDePasse: motDePasse
        }

        for (const elem in Object.values(postData))
        {
            if (elem === '')
            {
               setMissingData(true);
               break;
            }
        }

        if (!missingData)
        {
            // envoie post connexion
            AxiosTools.post('utilisateurs/verif_connexion', postData, (response: any) =>
            {
                if (response.data.success === 1)
                {
                    // reussite

                    // toast reussite
                    props.onValidationReceived(1, 'connexion', response.data.data)
                }
                else
                {
                    // echec de la connexion

                    // toast echec
                    props.onValidationReceived(0, 'connexion', null)
                }
            })
        }
    }

    return (
        <div className={style.FormLogin}>
            <h1>
                Connexion
            </h1>
            <Form noValidate validated={validated} onSubmit={handleLoginSubmit}>
                <Form.Group className="my-3">
                    <Form.Control
                        type="text"
                        placeholder="Pseudo"
                        value={pseudo}
                        onChange={handlePseudoChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="my-3">
                    <InputGroup>
                        <Form.Control
                            type={passwordVisible ? 'text' : 'password'}
                            value={motDePasse}
                            onChange={handleMotDePasseChange}
                            placeholder="Mot de passe"
                            required
                        />
                        <InputGroup.Text>
                            <FontAwesomeIcon
                                icon={passwordVisible ? faEye : faEyeSlash}
                                onClick={togglePasswordVisibility}
                                style={{ cursor: 'pointer' }}
                            />
                        </InputGroup.Text>
                    </InputGroup>
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
                        <Link to="/register">Créer un compte</Link>
                        <Link to="/form">Retour</Link>
                    </div>
                </div>
            </Form>
        </div>
    );
}

export default FormLogin