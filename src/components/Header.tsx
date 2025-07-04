import { Link } from 'react-router-dom'
import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Updated navigation items for the NEPA football broadcasting app
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/schools', label: 'Schools' },
    { path: '/sports', label: 'Sports' },
    { path: '/schedule', label: 'Schedule' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-primary-500 text-white shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-3 px-4">
        {/* Logo and Site Name */}
        <div className="flex items-center mb-2 sm:mb-0">
          <img src="/span-logo.png" alt="Span SportsHub Logo" className="h-24 w-auto mr-3" />
          <span className="text-2xl font-extrabold tracking-tight text-cream-100">Span SportsHub</span>
        </div>
        {/* Navigation */}
        <nav className="flex space-x-6 mb-2 sm:mb-0">
          {navItems.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="text-lg font-bold hover:underline text-cream-100 hover:text-secondary-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Social Icons */}
        <div className="flex space-x-4">
          {/* Facebook - outlined modern icon */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-secondary-300 text-cream-100 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M15 8.5h-1.5V7.5c0-.28.22-.5.5-.5H15V5h-1c-1.38 0-2.5 1.12-2.5 2.5V8.5H10V11h1.5v5H13v-5h1.25l.25-2.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </a>
          {/* Instagram - outlined modern icon */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-secondary-300 text-cream-100 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="17" cy="7" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </a>
          {/* Twitter - outlined modern icon */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-secondary-300 text-cream-100 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M8 15c6 0 9-5 9-9 0-.14 0-.28-.01-.42A6.48 6.48 0 0 0 19 4.5a6.36 6.36 0 0 1-1.89.52A3.28 3.28 0 0 0 18.5 3.5a6.56 6.56 0 0 1-2.08.8A3.28 3.28 0 0 0 12 8.28c0 .26.03.52.08.76A9.32 9.32 0 0 1 5 4.5s-4 9 5 13c-1.38.94-3.13 1.5-5 1.5.65 0 1.28-.07 1.89-.21A9.29 9.29 0 0 0 12 21c7.5 0 11.5-6.22 11.5-11.62 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 22 5.92a8.36 8.36 0 0 1-2.36.65A4.13 4.13 0 0 0 22 4.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </a>
        </div>

        {/* Mobile menu button - Only show on mobile, positioned to not interfere with logo */}
        <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-green-200 hover:text-green-300 focus:outline-none focus:text-green-300"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-green-600">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-3 rounded-md text-lg font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-green-200 bg-green-600'
                    : 'text-green-200 hover:text-green-300 hover:bg-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 