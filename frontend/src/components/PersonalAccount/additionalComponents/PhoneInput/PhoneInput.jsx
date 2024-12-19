import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css';

export default function PhoneInputComponent({ phone, onPhoneChange }) {
  return (
    <PhoneInput
      international
      defaultCountry="RU"
      value={phone}
      onChange={onPhoneChange}
      className="tel"
    />
  );
}
