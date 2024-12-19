import React, { useState } from "react";
import styles from "./CreateRequests.module.scss";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";

export default function CreateRequests() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneChange = (newPhone) => {
    setPhoneNumber(newPhone);
  };

  return (
    <div className={styles.create_wrapper}>
      <h3>Заполните вашу заявку</h3>
      <section>
        <h4>Сама проблема</h4>
        <input type="text" />
      </section>
      <section>
        <h4>Подробности (не обяз.)</h4>
        <textarea name="" id=""></textarea>
      </section>
      <section>
        <h4>Номер для связи</h4>
        <PhoneInput phone={phoneNumber} onPhoneChange={handlePhoneChange} />
      </section>
    </div>
  );
}
