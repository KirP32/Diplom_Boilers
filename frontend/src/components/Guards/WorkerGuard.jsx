import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const WorkerGuard = ({ children }) => {
    let token;
    if (localStorage.getItem('stay_logged') == 'false') {
        token = sessionStorage.getItem('accessToken');
    }
    else {
        token = localStorage.getItem('accessToken');
    }
    if (token && jwtDecode(token).access_level === 1) {
        return children;
    }
    return <Navigate to={'/'} />
};

export default WorkerGuard;