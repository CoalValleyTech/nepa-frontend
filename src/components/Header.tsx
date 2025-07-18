import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getSchools, School } from '../services/firebaseService'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [schoolsDropdownOpen, setSchoolsDropdownOpen] = useState(false)
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)
  const location = useLocation();

  // Updated navigation items for the NEPA football broadcasting app
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/schools', label: 'Schools' },
    { path: '/sports', label: 'Sports' },
    { path: '/schedule', label: 'Schedule' },
  ]

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    // Fetch schools for dropdown
    getSchools().then(setSchools).catch(() => setSchools([]))
  }, [])

  // Dropdown open/close handlers with delay to prevent flicker
  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setSchoolsDropdownOpen(true)
  }
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setSchoolsDropdownOpen(false), 200)
  }
  // Toggle dropdown for mobile/tap
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setSchoolsDropdownOpen((open) => !open);
  }
  // Close dropdown when clicking outside (mobile)
  useEffect(() => {
    if (!schoolsDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const dropdown = document.getElementById('schools-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setSchoolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [schoolsDropdownOpen]);

  return (
    <header className="bg-primary-500 text-white shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-3 px-4">
        {/* Logo and Site Name */}
        <div className="flex items-center mb-2 sm:mb-0">
          <img src="/span-logo.png" alt="Span SportsHub Logo" className="h-24 w-auto mr-3" />
          <span className="text-2xl font-extrabold tracking-tight text-cream-100">SPAN SPORTSHUB</span>
        </div>
        {/* Navigation */}
        <nav className="flex space-x-6 mb-2 sm:mb-0 relative">
          {navItems.map(link =>
            link.label === 'Schools' ? (
              <div
                key={link.path}
                className="relative group"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={link.path}
                  className="text-lg font-bold hover:underline text-cream-100 hover:text-secondary-300 transition-colors"
                  onClick={handleDropdownToggle}
                >
                  {link.label}
                </Link>
                {/* Dropdown */}
                {schoolsDropdownOpen && (
                  <div
                    id="schools-dropdown"
                    className="absolute mt-2 bg-white text-primary-700 rounded-lg shadow-xl z-50 border border-primary-200
                      w-full left-0 right-0 px-2 py-6 sm:left-1/2 sm:w-[700px] sm:px-10 sm:py-8 sm:min-w-[700px] sm:max-w-[1000px] sm:transform sm:-translate-x-1/2"
                    style={{ maxHeight: '90vh', overflowY: 'visible' }}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <h3 className="text-lg font-bold mb-3 text-primary-700">Schools</h3>
                    <div
                      className="grid gap-x-10 gap-y-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-6"
                      style={{
                        maxHeight: 'none',
                        overflowY: 'visible',
                      }}
                    >
                      {schools.length === 0 ? (
                        <div className="text-primary-400 text-center col-span-full">No schools available.</div>
                      ) : (
                        schools
                          .slice()
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(school => (
                            <Link
                              key={school.id}
                              to={`/schools/${school.id}`}
                              className="flex flex-col items-center justify-center hover:bg-primary-100 rounded px-4 py-3 transition-colors min-h-[90px]"
                              style={{ minWidth: '180px', maxWidth: '220px' }}
                              onClick={() => setSchoolsDropdownOpen(false)}
                            >
                              {school.logoUrl ? (
                                <img src={school.logoUrl} alt={school.name + ' logo'} className="h-12 w-12 object-contain rounded mb-2" />
                              ) : (
                                <div className="h-12 w-12 bg-primary-100 rounded flex items-center justify-center mb-2">
                                  <span className="text-primary-500 text-xs">No Logo</span>
                                </div>
                              )}
                              <span className="font-semibold text-base text-center whitespace-normal leading-tight break-words w-full">{school.name}</span>
                              <span className="text-primary-400 text-xs text-center whitespace-normal leading-tight break-words w-full">{school.location}</span>
                            </Link>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className="text-lg font-bold hover:underline text-cream-100 hover:text-secondary-300 transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        {/* Social Icons */}
        <div className="flex space-x-4">
          {/* Facebook - outlined modern icon */}
          <a
            href="https://www.facebook.com/share/15YYYyAKXS/?mibextid=wwXIfr"
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
            href="https://www.instagram.com/span_sportshub?igsh=ZmlyY203Y2V3czMw&utm_source=qr"
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
          {/* X - outlined modern icon */}
          <a
            href="https://x.com/spansportshub?s=21"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="hover:text-secondary-300 text-cream-100 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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