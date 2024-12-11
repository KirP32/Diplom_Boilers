import styles from "./Button.module.scss";

export default function Button({ children, isActive, className, ...props }) {
  return (
    <button
      {...props}
      className={`${styles.button} ${isActive ? styles.active : ""} ${
        className || ""
      }`}
    >
      {children}
    </button>
  );
}
