import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import $api from "../../http";
import axios from 'axios';

const PrivateRoute =  ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return children;
  }
  return <Navigate to={'/'} />
};

export default PrivateRoute;