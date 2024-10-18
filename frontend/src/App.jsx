import Header from './components/Header/Header';
import './App.scss'
import React, { Fragment, useState, useEffect } from 'react';
import { useCallback } from 'react';
import axios from "axios";
import Footer from './components/Footer/Footer';
import LogIn from './components/LogIn/LogIn';
import { useNavigate } from 'react-router-dom';

function App() {
  const [boiler, setBoiler] = useState([]);
  const [response_test, setResponse_test] = useState("");
  //http://185.46.10.111/api/changes?key=${key} - пока меняю на localhost
  const fetchInfo = useCallback(async () => {
    const key = 'Tula71F46aw8f9';
    try {
      const response = await axios.get(`http://185.46.10.111/api/changes?key=${key}`);
      setBoiler(response.data);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error.message);
      setBoiler(null);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const getTest = useCallback(async () => {
    try {
      const response = await axios.get(`http://185.46.10.111/api/test`);
      setResponse_test(response.data);
      console.log(`getTest response`);
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error.message);
      setResponse_test(null);
    }
  }, []);

  useEffect(() => {
    getTest();
  }, [getTest]);

  return (
    <div className="app_wrapper">
      <Header></Header>
      {/* <SendRequest /> */}

      <LogIn></LogIn>

      <div className="container__footer" style={{ gridColumn: '1 / -1' }}>
        <Footer />
      </div>
    </div>
  );
}

export default App