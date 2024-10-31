import Header from './components/Header/Header';
import './App.scss'
import React, { Fragment, useState, useEffect } from 'react';
import Footer from './components/Footer/Footer';
import LogIn from './components/LogIn/LogIn';
import 'material-icons/iconfont/material-icons.css';

function App() {
  const [boiler, setBoiler] = useState([]);
  const [response_test, setResponse_test] = useState("");
  //http://185.46.10.111/api/changes?key=${key} - пока меняю на localhost

  return (
    <div className="app_wrapper">
      <Header></Header>

      <LogIn></LogIn>
      {/* {localStorage.getItem('accessToken') && <>Добро пожаловать!</>} */}

      <div className="container__footer" style={{ gridColumn: '1 / -1' }}>
        <Footer />
      </div>
    </div>
  );
}

export default App