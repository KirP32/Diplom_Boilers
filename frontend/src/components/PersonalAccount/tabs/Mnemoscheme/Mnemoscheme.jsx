import React from "react";
import { MapContainer, TileLayer, useMap, ImageOverlay } from "react-leaflet";
//import "leaflet/dist/leaflet.css";
import styles from "./Mnemoscheme.module.scss";
import "leaflet/dist/leaflet.css";
import ads_boiler from "../../../../images/boiler_default.png";

export default function Mnemoscheme() {
  const imageSize = 1;
  const gap = 0.1;
  // верх/низ, право/лево
  // y x
  const bounds1 = [
    [0, 0], // нижняя левая точка
    [imageSize, imageSize], // верхняя-правая точка
  ];

  const bounds2 = [
    [0, imageSize + gap],
    [imageSize, imageSize * 2 + gap],
  ];

  const bounds3 = [
    [0, imageSize * 2 + gap * 2],
    [imageSize, imageSize * 3 + gap * 2],
  ];

  const bounds4 = [
    [0, imageSize * 1 + gap],
    [imageSize * 1, imageSize * 2],
  ];

  return (
    <div className={styles.map_wrapper}>
      <MapContainer
        center={[0.35, 1.5]}
        zoom={8}
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "hsl(0, 0%, 50%)",
        }}
        scrollWheelZoom={true}
      >
        <ImageOverlay url={ads_boiler} bounds={bounds1} />
        <ImageOverlay url={ads_boiler} bounds={bounds2} />
        <ImageOverlay url={ads_boiler} bounds={bounds3} />
      </MapContainer>
    </div>
  );
}
