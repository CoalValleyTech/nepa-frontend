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

  const socialLinks = [
    {
      href: 'https://facebook.com',
      label: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" fill="currentColor" />
        </svg>
      ),
    },
    {
      href: 'https://instagram.com',
      label: 'Instagram',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect width="20" height="20" x="2" y="2" rx="5" fill="currentColor" />
          <circle cx="12" cy="12" r="5" fill="white" />
          <circle cx="17" cy="7" r="1.5" fill="white" />
        </svg>
      ),
    },
    {
      href: 'https://x.com',
      label: 'X',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <header className="bg-primary-500 text-white shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-3 px-4">
        {/* Logo and Site Name */}
        <div className="flex items-center mb-2 sm:mb-0">
          <img src="/span-logo.png" alt="Span SportsHub Logo" className="h-12 w-auto mr-3" />
          <span className="text-2xl font-extrabold tracking-tight">Span SportsHub</span>
        </div>
        {/* Navigation */}
        <nav className="flex space-x-6 mb-2 sm:mb-0">
          {navItems.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="text-lg font-bold hover:underline hover:text-green-200 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Social Icons */}
        <div className="flex space-x-4">
          {socialLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="hover:text-green-200 transition-colors"
            >
              {link.icon}
            </a>
          ))}
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