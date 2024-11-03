import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import $api from "../../http";
import axios from 'axios';

const LoginGuard = ({ children }) => {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');

  if (token) {
    return <Navigate to={'/personalaccount'} />;
  }
  return children
};

export default LoginGuard;