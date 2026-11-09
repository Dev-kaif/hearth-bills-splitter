import { Link } from '@tanstack/react-router'

export function Brand() {
  return (
    <Link to="/" className="brand public-brand">
      <span className="brand-mark">h</span>
      <span>
        hearth<span className="brand-dot">.</span>
      </span>
    </Link>
  )
}
