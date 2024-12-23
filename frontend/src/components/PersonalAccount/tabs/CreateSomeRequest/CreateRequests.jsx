import React, { useState } from "react";
import styles from "./CreateRequests.module.scss";
import PhoneInput from "../../additionalComponents/PhoneInput/PhoneInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "../../../Button/Button";
import { fontSize, padding } from "@mui/system";

export default function CreateRequests({ deviceObject }) {
  const [phone, setPhone] = useState("");
  const [object, setObject] = useState("Другое");
  const deviceObjectTemp = [...deviceObject.boilers, { s_number: "Другое" }];

  function handleCreateRequest() {}

  return (
    <div className={styles.create_wrapper}>
      <h2>Заполните вашу заявку</h2>
      <div className={styles.form_wrapper}>
        <section className={styles.problem_input}>
          <h4>Ваша проблема</h4>
          <input type="text" />
        </section>
        <section>
          <h4>Проблема с:</h4>
          <FormControl
            variant="standard"
            sx={{
              m: 1,
              color: "white",
              backgroundColor: "white",
              width: "100%",
              margin: 0,
            }}
          >
            <Select
              value={object}
              onChange={(e) => setObject(e.target.value)}
              sx={{
                fontSize: 17,
              }}
            >
              {deviceObjectTemp.map((item, index) => (
                <MenuItem
                  key={index}
                  value={item.s_number}
                  sx={{ fontSize: 17 }}
                >
                  {item.s_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </section>
        <section>
          <h4>Подробности</h4>
          <textarea name="" id="" className={styles.textarea_input} />
        </section>
        <section className={styles.phone_section}>
          <h4>Номер для связи</h4>
          <PhoneInput
            phone={phone}
            onPhoneChange={(newPhone) => {
              setPhone(newPhone);
            }}
            style={{ fontSize: 17 }}
          />
        </section>

        <Button style={{ fontSize: 17 }} onClick={handleCreateRequest}>
          Создать
        </Button>
      </div>
    </div>
  );
}
