import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const WorkerGuard = ({ children }) => {

    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (token && jwtDecode(token).access_level === 1) {
        return children;
    }
    return <Navigate to={'/'} />
};

export default WorkerGuard;