import React from "react";
import { MapContainer, ImageOverlay } from "react-leaflet";
//import "leaflet/dist/leaflet.css";
import "./Mnemoscheme.scss";
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
    <MapContainer
      center={[0, 0]}
      zoom={8}
      style={{
        width: "100%",
        height: "500px",
        backgroundColor: "hsl(0, 0%, 50%)",
      }}
      scrollWheelZoom={true}
    >
      <ImageOverlay
        url="https://geffen.ru/upload/resize_cache/iblock/862/vz3gpzut4973eb6a9sa9rrq9i4v64bqn/490_490_0/d644d6d3_ad55_11e9_9930_00155d016401_2f898086_0589_11ec_a597_005056010522.jpg"
        bounds={bounds1}
      />
      <ImageOverlay
        url="https://geffen.ru/upload/resize_cache/iblock/862/vz3gpzut4973eb6a9sa9rrq9i4v64bqn/490_490_0/d644d6d3_ad55_11e9_9930_00155d016401_2f898086_0589_11ec_a597_005056010522.jpg"
        bounds={bounds2}
      />
      <ImageOverlay
        url="https://geffen.ru/upload/resize_cache/iblock/862/vz3gpzut4973eb6a9sa9rrq9i4v64bqn/490_490_0/d644d6d3_ad55_11e9_9930_00155d016401_2f898086_0589_11ec_a597_005056010522.jpg"
        bounds={bounds3}
      />
    </MapContainer>
  );
}
