import React, { useState } from "react";

import { Button, Form, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';

// style
import style from './Plus.module.css';

//fontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUnlock, faLock } from '@fortawesome/free-solid-svg-icons';

// tools
import AxiosTools from '../../utils/Axios';
import { User } from '../../utils/Constants';
import Tools from '../../utils/Tools';

interface PlusProps {
    displayPlus: boolean;
    onCreateChannel: (success: number, type: string, data: any) => void;
}

const Plus = (props: PlusProps) => {

    // on recupere le cookie user
    const user: User | null = Tools.getCookie('user') !== '' ? JSON.parse(Tools.getCookie('user')) : null;

    const [validated, setValidated] = useState(false);

    const [missingData, setMissingData] = useState(false);

    const [nomCanal, setNomCanal] = useState('');
    const [lock, setLock] = useState(false);

    const handleNomCanalChange = (e: any) => {
        setNomCanal(e.target.value);
    };

    // salon prive ou public
    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            { lock ? "Privé" : "Public" }
        </Tooltip>
    );

    // afficher et fermer le modal de la creation de canal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleCreateChannel = (e: any) => {
        e.preventDefault();

        // verification
        const form:any = e.currentTarget;
        if (form.checkValidity() === false)
        {
            e.stopPropagation();
        }

        setValidated(true);

        interface PostData {
            idUtilisateur: number | undefined;
            NomCanal: string;
            Prive: boolean;
        }

        const postData: PostData = {
            idUtilisateur: user !== null ? user._id : undefined,
            NomCanal: nomCanal,
            Prive: lock
        }

        for (const value of Object.values(postData)) {
            // on verifie si tous les elements sont presents
            if (value === undefined || value === '') {
                setMissingData(true);
                break;
            }
        }

        if (!missingData)
        {
            AxiosTools.post('canal/inserer', postData, (response: any) => {
                if (response.data.success === 1)
                {
                    // reussite

                    // toast reussite
                    props.onCreateChannel(1, 'creation_channel', null)
                }
                else
                {
                    // echec de la creation du canal

                    // toast echec
                    props.onCreateChannel(0, 'creation_channel', null)
                }
            });
        }
    }


    return(
        props.displayPlus ? (
            <div className={style.modalAddCanal}>
                <Modal
                    show={show}
                    onHide={handleClose}
                    className={style.modal}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Creer un canal</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form
                            noValidate
                            validated={validated}
                            onSubmit={handleCreateChannel}
                        >
                            <Form.Group className="mb-3">
                                <Form.Label>Nom du canal</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={nomCanal}
                                    onChange={handleNomCanalChange}
                                    autoFocus
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Statut</Form.Label>
                                <div className="d-flex align-items-center">
                                    <OverlayTrigger
                                        placement="top"
                                        delay={{ show: 250, hide: 400 }}
                                        overlay={renderTooltip}
                                    >
                                        <Form.Check
                                            type="switch"
                                            onChange={() => setLock(!lock)}
                                        />
                                    </OverlayTrigger>
                                    <FontAwesomeIcon icon={lock ? faLock : faUnlock} className="ms-2" />
                                </div>
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Fermer
                        </Button>
                        <Button type="submit" variant="primary" onClick={handleCreateChannel}>
                            Créer
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className={style.plus}>
                    <Button
                        variant="outline-secondary"
                        className="rounded-pill"
                        onClick={handleShow}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </div>
            </div>
        ) : null
    )
}

export default Plus;