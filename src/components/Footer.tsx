import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-primary-500 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 md:gap-6 relative">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-orange-400">Contact Us:</span>
            <span className="text-orange-400 font-medium">Contact@SpanSportsHub.com</span>
          </div>
          <span className="text-cream-200 text-sm">&copy; 2024 SPAN SportsHub. All rights reserved.</span>
          {/* Gear Icon Button */}
          <button
            onClick={() => navigate('/login')}
            aria-label="Go to Login"
            className="absolute right-0 md:static md:ml-4 p-2 rounded-full hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-7 h-7 text-orange-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.03-2.11a1 1 0 0 0 .21-1.09l-1.07-1.85a1 1 0 0 1 0-.98l1.07-1.85a1 1 0 0 0-.21-1.09l-1.42-1.42a1 1 0 0 0-1.09-.21l-1.85 1.07a1 1 0 0 1-.98 0l-1.85-1.07a1 1 0 0 0-1.09.21l-1.42 1.42a1 1 0 0 0-.21 1.09l1.07 1.85a1 1 0 0 1 0 .98l-1.07 1.85a1 1 0 0 0 .21 1.09l1.42 1.42a1 1 0 0 0 1.09.21l1.85-1.07a1 1 0 0 1 .98 0l1.85 1.07a1 1 0 0 0 1.09-.21l1.42-1.42z"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer 