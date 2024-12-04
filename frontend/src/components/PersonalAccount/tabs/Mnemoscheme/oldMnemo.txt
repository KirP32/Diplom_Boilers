import React from "react";
import styles from "./Mnemoscheme.module.scss";
import data from "./data";

export default function Mnemoscheme() {
  function sorted_array(data) {
    const length = data.length;
    let array = [];
    // #TODO: как устройства между собой связываются.
  }
  return (
    <div
      className="wrapper"
      style={{
        display: "flex",
        gap: 15,
        flexWrap: "wrap",
        height: 770,
        padding: "0 15px 15px 15px",
      }}
    >
      {data.map((item, index) => (
        <div className={styles.container} key={index}>
          {item.name.includes("boiler") && (
            <>
              <section style={{ placeItems: "center", display: "flex" }}>
                <button>Один</button>
                <button>Два</button>
              </section>
              <img
                className={styles.picture}
                src="https://geffen.ru/upload/resize_cache/iblock/862/vz3gpzut4973eb6a9sa9rrq9i4v64bqn/490_490_0/d644d6d3_ad55_11e9_9930_00155d016401_2f898086_0589_11ec_a597_005056010522.jpg"
                alt=""
              />
            </>
          )}
          {!item.name.includes("boiler") && (
            <>
              <h4 style={{ textAlign: "center" }}>{item.name}</h4>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
