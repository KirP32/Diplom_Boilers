import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../Theme";
import { jwtDecode } from "jwt-decode";

const ContractGuard = ({ children }) => {
  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    "";

  if (token !== "") {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (
        decoded.exp &&
        decoded.exp > currentTime &&
        decoded.access_level === 1
      ) {
        return children;
      }
    } catch (error) {
      console.error("Ошибка при декодировании токена", error);
    }
  }

  return <Navigate to={"/"} />;
};

export default ContractGuard;
