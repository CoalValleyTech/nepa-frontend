import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-primary-500 text-cream-100 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h3 className="font-bold text-orange-400 mb-2">Contact Us</h3>
            <p className="text-cream-200 text-sm mb-1">contact@spansportshub.com</p>
            <p className="text-cream-200 text-sm">NEPA Sports Hub</p>
          </div>
          
          {/* Coal Valley Technology */}
          <div className="text-center">
            <h3 className="font-bold text-orange-400 mb-2">Website Management</h3>
            <p className="text-cream-200 text-sm mb-1">Coal Valley Technology</p>
            <a 
              href="mailto:coalvalleytech@gmail.com" 
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            >
              coalvalleytech@gmail.com
            </a>
          </div>
          
          {/* Admin Access */}
          <div className="text-center md:text-right">
            <h3 className="font-bold text-orange-400 mb-2">Administration</h3>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-primary-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Admin Login
            </button>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-primary-400 pt-4 text-center">
          <span className="text-cream-200 text-sm">&copy; 2025 SPAN SportsHub. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer 