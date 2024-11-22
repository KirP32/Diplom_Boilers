import Header from "./components/Header/Header";
import "./App.scss";
import React, { useContext } from "react";
import Footer from "./components/Footer/Footer";
import LogIn from "./components/LogIn/LogIn";
import "material-icons/iconfont/material-icons.css";
import { ThemeContext } from "./Theme";

export default function App() {
  return (
    <div className={`app_wrapper`}>
      <Header></Header>
      <LogIn></LogIn>
      <div className="container__footer" style={{ gridColumn: "1 / -1" }}>
        <Footer />
      </div>
    </div>
  );
}
