import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-primary-600 mb-4">Page Not Found</h2>
        <p className="text-primary-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="btn-primary"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound 