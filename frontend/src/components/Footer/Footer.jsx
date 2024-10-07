import ads_data from "../../images/data.svg"
import ads_di from "../../images/di.svg"
import ads_line from "../../images/line.svg"
import styles from './Footer.module.scss'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <img src={ads_line} alt="" />
            <div className={styles.section}>
                <h4>Контактная информация</h4>
                <ul className={styles.section}>
                    <li>ул. Щегловская Засека, 31</li>
                    <li>
                        8 (800) 700-**-**
                    </li>
                    <li>
                        geffen.ru
                    </li>
                </ul>
            </div>
            <img src={ads_data} alt="" />
            <img src={ads_di} alt="" />
        </footer>
    )
}