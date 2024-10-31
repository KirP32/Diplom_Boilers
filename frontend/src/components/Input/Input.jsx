import styles from './Input.module.scss'

export default function Input({ ...props }) {
    return (
        <input className={styles.custom_input}
            placeholder={props.placeholder}
            {...props}>
        </input>
    )
}