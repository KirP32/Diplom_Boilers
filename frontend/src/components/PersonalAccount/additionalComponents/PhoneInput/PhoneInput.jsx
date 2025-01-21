import React, { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export default function PhoneInputComponent({ phone, onPhoneChange, style }) {
  return (
    <div
      className="phone-input-container"
      style={{ position: "relative", zIndex: 2 }}
    >
      <PhoneInput
        defaultCountry="ru"
        value={phone}
        onChange={(value) => onPhoneChange(value)}
        disableCountryGuess={true}
        inputStyle={style}
      />
    </div>
  );
}
