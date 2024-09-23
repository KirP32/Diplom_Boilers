import styles from './Button.module.scss'

// console.log(styles);

export default function Button({ children, isActive, ...props }) {

    return (
        <button 
        {...props}
        className={isActive ? `${styles.active} ${styles.button}` : styles.button}
        >{children}</button>
    )
}
