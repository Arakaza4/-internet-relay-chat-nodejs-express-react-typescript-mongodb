import React, { useState, useEffect } from "react";

// react-router-dom
import { Link } from 'react-router-dom';

// style
import style from "./FormRegister.module.css"

// bootstrap:
import { Form, InputGroup, Button } from 'react-bootstrap';

//fontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// tools
import AxiosTools from '../../../utils/Axios';
import { User } from '../../../utils/Constants';
import Tools from '../../../utils/Tools';

interface FormRegisterProps {
    action: string;
    onValidationReceived: (success: number, type: string, data: any) => void;
}

function FormRegister(props: FormRegisterProps)
{
    const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')) : null;

    const [validated, setValidated] = useState<boolean>(false);

    const [missingData, setMissingData] = useState<boolean>(false);

    const [nom, setNom] = useState<string>('');
    const [prenom, setPrenom] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [pseudo, setPseudo] = useState<string>('');
    const [motDePasse, setMotDePasse] = useState<string>('');

    const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNom(e.target.value);
    };

    const handlePrenomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrenom(e.target.value);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };

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
    
    useEffect(() => {
        if (user !== null && props.action === 'modifier_compte')
        {
            setNom(user.Nom ? user.Nom : '');
            setPrenom(user.Prenom ? user.Prenom : '');
            setDate(user.Date ? user.Date : '');
            setPseudo(user.Pseudo ? user.Pseudo : '');
            setMotDePasse(user.MotDePasse ? user.MotDePasse : '');
        }
    }, [user, props.action])

    function handleManageAccountSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // verification
        const form:any = e.currentTarget;
        if (form.checkValidity() === false)
        {
            e.stopPropagation();
        }

        setValidated(true);

        interface PostData {
            Nom: string;
            Prenom: string;
            DateNaissance: string;
            Pseudo: string;
            MotDePasse: string;
        }

        interface PostDataUpdate extends PostData {
            _id: number;
        }

        let postData: PostData | null = null;

        if (user !== null && user._id !== undefined)
        {
            postData = {
                _id: user._id,
                Nom: nom,
                Prenom: prenom,
                DateNaissance: date,
                Pseudo: pseudo,
                MotDePasse: motDePasse
            } as PostDataUpdate
        }
        else
        {
            postData = {
                Nom: nom,
                Prenom: prenom,
                DateNaissance: date,
                Pseudo: pseudo,
                MotDePasse: motDePasse
            } as PostData
        }

        for (const elem in Object.values(postData))
        {
            // on verifie si tous les elements sont presents
            if (elem === '')
            {
               setMissingData(true);
               break;
            }
        }

        if (!missingData)
        {
            if (user !== null && user._id === undefined)
            {
                // envoie update pour modification compte
                AxiosTools.put('utilisateurs/modifier', postData, (response: any) => {
                    if (response.data.success === 1)
                    {
                        // reussite
    
                        // toast reussite
                        props.onValidationReceived(1, 'update_compte', null)
                    }
                    else
                    {
                        // echec de la creation de compte
    
                        // toast echec
                        props.onValidationReceived(0, 'update_compte', null)
                    }
                })
            }
            else
            {
                // envoie post pour creation de compte
                AxiosTools.post('utilisateurs/inserer', postData, (response: any) => {
                    if (response.data.success === 1)
                    {
                        // reussite
    
                        // toast reussite
                        props.onValidationReceived(1, 'creation_compte', null)
                    }
                    else
                    {
                        // echec de la creation de compte
    
                        // toast echec
                        props.onValidationReceived(0, 'creation_compte', null)
                    }
                })
            }
        }
    }

    return (
        <div className={style.FormRegister}>
            <h1>
                {
                    user !== null /*&& user._id !== undefined*/ ? 'Modifier compte' : 'Création de compte'
                }
            </h1>
            <Form
                noValidate
                validated={validated}
                onSubmit={handleManageAccountSubmit}
            >
                <Form.Group className="my-3">
                    <Form.Control
                        type="text"
                        placeholder="Nom"
                        value={nom}
                        onChange={handleNomChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="my-3">
                    <Form.Control
                        type="text"
                        placeholder="Prenom"
                        value={prenom}
                        onChange={handlePrenomChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="my-3">
                    <Form.Control
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        required
                    />
                </Form.Group>
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
                    {
                        user === null || user._id !== undefined ?
                        (
                            <div className={style.linkUp}>
                                <Link to="/login">Se connecter</Link>
                                <Link to="/form">Retour</Link>
                            </div>
                        )
                        : null
                    }
                </div>
            </Form>
        </div>
    );
}

export default FormRegister