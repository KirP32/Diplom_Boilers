import './Input.scss'

export default function Input({...props }) {
    return (
        <input
        placeholder={props.placeholder}
            {...props}>
        </input>
    )
}