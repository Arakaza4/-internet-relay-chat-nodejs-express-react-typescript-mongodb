import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Display from '../pages/Display'

// log
import LogGuest from '../pages/LogGuest';
import Register from '../pages/Register';
import Login from '../pages/Login';

import Head from "../components/Header/Header";

const Routing = () => {

    return (
        <Router>
            <Routes>
                { /* home */ }
                <Route path='/' element={<Display />} />
                <Route path='/index' element={<Display />} />

                { /* log */ }
                <Route path='/form' element={<LogGuest />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/compte' element={<Register action={'modifier_compte'}/>} />

                <Route path="/test" element={<Head />} />
            </Routes>
        </Router>
    );
};

export default Routing;