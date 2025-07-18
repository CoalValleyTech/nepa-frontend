import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-primary-500 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 md:gap-6 relative w-full">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-orange-400">Contact Us:</span>
            <span className="text-orange-400 font-medium">contact@spansportshub.com</span>
          </div>
          <span className="text-cream-200 text-sm">&copy; 2025 SPAN SportsHub. All rights reserved.</span>
          {/* Pencil Icon Button - right aligned in footer */}
          <button
            onClick={() => navigate('/login')}
            aria-label="Go to Login"
            className="ml-auto md:ml-4 p-3 rounded-full bg-orange-400 hover:bg-orange-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-7 h-7 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16.862 5.487a2.1 2.1 0 1 1 2.97 2.97l-9.193 9.193a2 2 0 0 1-.878.51l-3.06.817a.5.5 0 0 1-.61-.61l.817-3.06a2 2 0 0 1 .51-.878l9.193-9.193z"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer 