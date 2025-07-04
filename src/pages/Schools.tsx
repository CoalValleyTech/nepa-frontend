import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://facebook.com/',
    svg: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28" className="text-cream-100 hover:text-secondary-300 transition-colors duration-200">
        <circle cx="14" cy="14" r="14" fill="currentColor" fillOpacity="0.15"/>
        <path d="M17.5 8.75h2.083V6.125A25.5 25.5 0 0 0 16.25 6c-2.625 0-4.375 1.5-4.375 4.25v2H8.75v2.75h3.125V22h3.125v-7h2.292l.333-2.75h-2.625v-1.5c0-.792.208-1.25 1.25-1.25z" fill="currentColor"/>
      </svg>
    )
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/',
    svg: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28" className="text-cream-100 hover:text-secondary-300 transition-colors duration-200">
        <circle cx="14" cy="14" r="14" fill="currentColor" fillOpacity="0.15"/>
        <rect x="8" y="8" width="12" height="12" rx="4" stroke="currentColor" strokeWidth="2"/>
        <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="2"/>
        <circle cx="18.5" cy="9.5" r="1" fill="currentColor"/>
      </svg>
    )
  },
  {
    name: 'X',
    url: 'https://x.com/',
    svg: (
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28" className="text-cream-100 hover:text-secondary-300 transition-colors duration-200">
        <circle cx="14" cy="14" r="14" fill="currentColor" fillOpacity="0.15"/>
        <path d="M10.5 9h2.1l2.1 2.7L16.8 9h2.1l-3 3.9 3.3 4.1h-2.1l-2.4-3.1-2.4 3.1H9l3.3-4.1-3-3.9z" fill="currentColor"/>
      </svg>
    )
  }
];

const Schools = () => (
  <div className="min-h-screen">
    <Header />
    {/* Schools content */}
    <div className="flex flex-col items-center justify-center bg-cream-50 py-16">
      <h1 className="text-3xl font-bold text-primary-600 mb-4">Schools</h1>
      <p className="text-lg text-primary-500">This is the Schools page. Content coming soon!</p>
    </div>
  </div>
);

export default Schools; 