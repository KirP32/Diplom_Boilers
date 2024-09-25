import Header from './components/Header';
import reactLogo from './assets/react.svg'
import './App.scss'
import IntroSection from './components/IntroSection'
import React, { Fragment, useState, useEffect } from 'react';
import { useCallback } from 'react';
import axios from "axios";
import TabsSection from './components/TabsSection'
import MainSection from './components/MainSection'
import ChooseSection from './components/ChooseSection'
import FeedbackSection from './components/FeedbackSection'
import EffectSection from './components/EffectSection'
import Playground from './components/Playground'

function App() {
  const [tab, setTab] = useState('effect');
  const [boiler, setBoiler] = useState([]);
  const [response, setResponse] = useState("");
  const [response_test, setResponse_test] = useState("");
  let [data, setData] = useState({ id: "", lastchanges: "" });

  const fetchInfo = useCallback(async () => {
    const key = 'Tula71F46aw8f9';
    try {
      const response = await axios.get(`http://185.46.10.111/changes?key=${key}`);
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
      const response = await axios.get(`http://185.46.10.111/test`);
      setResponse_test(response.data);
      console.log("getTest OK");
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error.message);
      setResponse_test(null);
    }
  }, []);

  useEffect(() => {
    getTest();
  }, [getTest]);

  const handleChange = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    let boiler_key = 'esptest';
    data = { ...data, boiler_key: boiler_key }
    event.preventDefault();
    axios
      .post("http://185.46.10.111/info", data)
      .then((response) => {
        setResponse(response.data);
      })
      .catch((error) => {
        console.log(error);
        setResponse("Произошла ошибка");
      });
  };

  return (
    <Fragment>
      <Header></Header>
      <main>
        <IntroSection />
        <TabsSection active={tab} onChange={(current) => setTab(current)} />
        {tab === 'main' &&
          <>
            <MainSection></MainSection>
            <ChooseSection></ChooseSection>
          </>}

        {tab === 'feedback' &&
          <>
            <FeedbackSection />
          </>}

        {tab === 'effect' &&
          <>
            <EffectSection></EffectSection>
          </>
        }
        {
          tab === 'playground' &&
          <>
            <Playground></Playground>
          </>
        }
      </main>
      <form onSubmit={handleSubmit}>
        <label htmlFor="id">Номер котла</label>
        <input type="text"
          id="id"
          value={data.id}
          onChange={handleChange}
          name='id' />
        <label htmlFor="lastchanges">Изменения</label>
        <input type="text"
          id="lastchanges"
          name='lastchanges'
          value={data.lastchanges}
          onChange={handleChange} />
        <button type='submit' style={{ width: 75, height: 40 }}>Отправить на сервер</button>
      </form>
      <>
        {response && (
          <p>
            {response}
          </p>
        )}
      </>
      <section>
        {Array.isArray(boiler) && boiler.map(item => (
          <div key={item.id}>
            <h2>{item.temperature}</h2>
          </div>
        ))}
      </section>
    </Fragment>
  );
}

export default App
