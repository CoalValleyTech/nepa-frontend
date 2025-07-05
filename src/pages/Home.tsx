import Header from '../components/Header';
import { useState, useEffect } from 'react';

export default function Home() {
  const [expanded, setExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  const article = {
    title: 'Welcome to SPAN SportsHub',
    date: 'July 7, 2025',
    preview: 'The Scranton Public Athletic Network was established in 2025 to provide student-athletes, families, coaches, and the community... ',
    content: `The Scranton Public Athletic Network was established in 2025 to provide student-athletes, families, coaches, and the community with the most accurate stats provided by the teams. We are committed to keeping our services free to allow for everyone to access our content. 
On the website, you will be able to find all schools located in the Lackawanna Interscholastic Athletics Association and their respective teams. You will also find links to video and radio broadcasts, so you can watch or listen to your favorite teams on the go. You can also find us on Facebook and Instagram, where we will post information, recaps, and leaderboards about all your favorite teams! 
Our current resources only allow us to cover Girls' Tennis and Football for the Fall 2025 Season. As we look to expand into more sports in the coming season, we will look for more opportunities to grow and expand our brand. Stay tuned in the following weeks and months as we announce more exciting things that have yet to come!
`,
  };

  // Show popup on first load
  useEffect(() => {
    setShowPopup(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-500 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 text-center">
                  <img 
                    src="/span-logo.png" 
                    alt="SPAN Logo" 
                    className="w-48 h-48 object-contain mx-auto mb-4"
                  />
                  <h2 className="text-3xl font-bold text-cream-100">Welcome to SPAN SportsHub!</h2>
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-cream-100 hover:text-cream-200 text-3xl font-bold leading-none ml-4"
                  aria-label="Close popup"
                >
                  ×
                </button>
              </div>
              <div className="space-y-6 text-cream-100 text-lg">
                <p>
                  Welcome to SPAN Sports Hub! We provide statistics, scores, and more for all high schools part of the Lackawanna Interscholastic Athletics Association. Stay tuned as we enter the fall sports season, as we provide you with scores, stats, and leaderboards for Girls Tennis and Football!
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-secondary-500 text-white px-8 py-3 rounded-lg hover:bg-secondary-600 transition-colors font-semibold text-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Section with Scores and Schedule Sidebars */}
      <section className="py-8 bg-cream-50">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Side - Latest News and Article */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-primary-500 mb-6">Latest News</h2>
              {/* Article Preview Section */}
              <button
                className="w-full bg-white rounded-lg shadow p-6 text-left mb-4 cursor-pointer hover:bg-cream-50 transition focus:outline-none focus:ring-2 focus:ring-secondary-400"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse article' : 'Expand article'}
                type="button"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-primary-400">{article.date}</span>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-semibold">Article</span>
                </div>
                <h3 className="text-xl font-bold text-primary-700 mb-2">{article.title}</h3>
                <p className="text-primary-600 mb-2">
                  {expanded ? article.content : article.preview}
                </p>
                <span className="text-secondary-500 font-semibold hover:underline">
                  {expanded ? 'Show Less' : 'Read Full Article →'}
                </span>
              </button>
            </div>
            {/* Vertical Line Divider */}
            <div className="hidden lg:block w-px bg-primary-300 mx-2"></div>
            {/* Right Side - Scores and Schedule Sections */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:w-auto">
              {/* Scores Section */}
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                <h2 className="text-2xl font-bold text-primary-500 mb-6 text-center">Scores</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto text-center text-primary-400 font-semibold">
                  No scores to display.
                </div>
              </div>
              {/* Vertical Line Divider between Scores and Schedule */}
              <div className="hidden lg:block w-px bg-primary-300"></div>
              {/* Schedule Section */}
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                <h2 className="text-2xl font-bold text-primary-500 mb-6 text-center">Schedule</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto text-center text-primary-400 font-semibold">
                  No games scheduled.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-16 bg-primary-500 text-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <div className="text-lg leading-relaxed space-y-4">
            <p>
            At SPAN, we are dedicated to providing the greater Scranton Area with stats, Scores,
            Leaderboards, and more, and providing a platform where all sports can be recognized equally. It is important to us that we keep our services free and allow anyone to access our content wherever they are at any time. 
            Whether it is seeing that latest score update from your favorite tennis team, to seeing how many yards your son ran during his most recent game, or even seeing where you can stream your favorite sports, we want to be 
            the HUB for all things LIAA!

            </p>
            <p>
            We are determined to preserve the culture and richness of high school sports that the greater Scranton Area was built on, while also launching it into the next generation. We want to support
            all student-athletes by building a platform for all!
            </p>
            <p className="text-secondary-300 font-semibold">
              Supporting NEPA Sports - One Game at a Time
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 