import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../Theme";
import { jwtDecode } from "jwt-decode";

const ContractGuard = ({ children }) => {
  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken");
  if (jwtDecode(token).access_level === 1) {
    return children;
  }
  return <Navigate to={"/"} />;
};

export default ContractGuard;
