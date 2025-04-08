/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import $api from "../../../../../../../http";

export default function Materials({
  requestID,
  access_level,
  worker_username,
}) {
  const [servicesAndGoods, setServicesAndGoods] = useState([null]);
  async function getPricesAndGoods() {
    await $api
      .get(`/getServicesAndGoods/?workerUsername=${worker_username}`)
      .then((result) => {
        setServicesAndGoods(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  useEffect(() => {
    getPricesAndGoods();
  });

  return (
    <>
      <h4 style={{ textAlign: "center", fontSize: 19 }}>
        Выберите услуги и запчасти
      </h4>
      <div className="container">
        <div className="services"></div>
        <div className="goods"></div>
      </div>
    </>
  );
}
