import React from "react";

// router
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';

// style
import style from './Header.module.css';

// boostrap
import { Container, Nav, Navbar, Button } from 'react-bootstrap';

//fontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faComments, faPowerOff } from '@fortawesome/free-solid-svg-icons';

import { User } from '../../utils/Constants';
import Tools from '../../utils/Tools';

function Header() {
    
    const user: User | string | null = Tools.getCookie('user') !== '' ? Tools.getCookie('user') : null;

    const navigate: NavigateFunction = useNavigate();

    // deconnexion
    const handleLogOut = () => {

        // suppression de tous les cookies
        Tools.deleteAllCookies();

        navigate('/form');
        window.location.reload();
    }

    // modifier son compte
    const handleUpdateAccount = () => {
        navigate('/compte', {
            state: { item:user }
        });
    };

    return (
        <header className={style.header}>
            <Navbar expand="lg" className="h-auto">
                <Container fluid className='mx-5 my-3 d-flex flex-row justify-content-between'>
                    <div className="logoHeader">
                        <Link className="nav-link" to="/index">
                            <Navbar.Brand>
                                Instant Real Chat
                            </Navbar.Brand>
                        </Link>
                    </div>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                        className="my-2 my-lg-0"
                        style={{ maxHeight: '100px', width: '100%' }}
                        >
                        {
                            (user !== null) ? (
                                // sinon afficher sign in / log in
                                <div className='connectedBtn'>
                                    <Nav.Link href="/index">
                                        <FontAwesomeIcon icon={faComments} />
                                    </Nav.Link>
                                    {
                                        user !== null && Object.keys(user).length > 1 ?
                                        (
                                            <Nav.Link
                                                onClick={handleUpdateAccount}
                                            >
                                                <FontAwesomeIcon icon={faUser} />
                                            </Nav.Link>
                                        ) : null
                                    }
                                    <Button
                                        variant='outline-danger'
                                        onClick={handleLogOut}
                                    >
                                        <FontAwesomeIcon icon={faPowerOff} />
                                    </Button>
                                </div>
                            ) : null
                        }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default Header;