import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ThemeContext } from "../../Theme";
import { useContext } from "react";
const ContractGuard = ({ children }) => {
  const { access_level } = useContext(ThemeContext);
  console.log(access_level);
  // читает access_level до получения значения с сервера
  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    "";
  if (token !== "" && jwtDecode(token).access_level === 1) {
    return children;
  }
  return <Navigate to={"/"} />;
};

export default ContractGuard;
