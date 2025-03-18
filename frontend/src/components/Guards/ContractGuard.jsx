import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../Theme";

const ContractGuard = ({ children }) => {
  const { access_level } = useContext(ThemeContext);
  if (access_level === 1) {
    return children;
  }
  return <Navigate to={"/"} />;
};

export default ContractGuard;
