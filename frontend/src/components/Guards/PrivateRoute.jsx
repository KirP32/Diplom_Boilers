import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken");
  // else if (jwtDecode(token).access_level === 1) {
  //   return <Navigate to={'/workerpanel'} />;
  // }
  if (token) {
    return children;
  }
  return <Navigate to={"/"} />;
};

export default PrivateRoute;
