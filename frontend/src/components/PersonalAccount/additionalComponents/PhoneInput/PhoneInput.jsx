import React, { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

export default function PhoneInputComponent({ phone, onPhoneChange }) {
  return (
    <div className="phone-input-container">
      <PhoneInput
        defaultCountry="ru"
        value={phone}
        onChange={(value) => onPhoneChange(value)}
        disableCountryGuess={true}
      />
    </div>
  );
}
