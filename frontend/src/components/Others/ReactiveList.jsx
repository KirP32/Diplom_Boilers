export default function ReactiveList({ title, description }) {
  return (
    <li>
      <h3><strong>{title}</strong></h3>
      <p>
        {description}
      </p>
    </li>
  )
}