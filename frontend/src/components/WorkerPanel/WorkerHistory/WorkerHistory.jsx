import { useEffect, useState } from 'react';
import $api from '../../../http'
import styles from './WorkerHistory.module.scss'

export default function WorkerHistory() {
    const [actionsArr, setActionsArr] = useState([]);

    useEffect(() => { getActions() }, []);

    async function getActions() {
        try {
            const result = await $api.post('/getActions');
            setActionsArr(result.data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={styles.worker_history__wrapper}>
            {actionsArr.length === 0 ? (
                <div className={styles.worker_history__onError}><h4>Событий нет</h4></div>
            ) : (
                <>
                    <div className={styles.worker_history__header}>
                        <span className={styles.header__username}>Клиент</span>
                        <span className={styles.header__action}>Событие</span>
                        <span className={styles.header__time}>Время</span>
                    </div>
                    <div className={styles.worker_history__list}>
                        {actionsArr.map((item, index) => (
                            <div key={index} className={`${styles.worker_history__list__item} ${index % 2 === 0 ? styles.even : styles.odd}`}>
                                <span className={styles.worker_history__list__item__username}>{item.username}</span>
                                <span className={styles.worker_history__list__item__action}>{item.action}</span>
                                <span className={styles.worker_history__list__item__time}>{new Date(item.time).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}