import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-500 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-orange-400">Contact Us:</span>
            <span className="text-orange-400 font-medium">Contact@SpanSportsHub.com</span>
          </div>
          <span className="text-cream-200 text-sm">&copy; 2024 SPAN SportsHub. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer 