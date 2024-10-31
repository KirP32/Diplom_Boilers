import styles from './WorkerPanel.module.scss'
import Button from '../Button/Button'

export default function WorkerPanel() {

    return (
        <div className={styles.worker_wrapper}>
            <div className={styles.worker_wrapper__sidebar}>
                <Button>Регистрация пользователя</Button>
                <Button>Добавить устройство</Button>
                <Button>Редактирование</Button>
            </div>
            <div className={styles.worker_wrapper__main}></div>
        </div>
    )
}