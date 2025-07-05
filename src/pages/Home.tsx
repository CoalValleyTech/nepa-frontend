import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      {/* Main Content Section with Scores and Schedule Sidebars */}
      <section className="py-8 bg-cream-50">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Side - Welcome Message */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-primary-500 mb-6">Welcome</h2>
              <div className="bg-cream-100 rounded-lg p-6 lg:p-8 shadow-lg text-center text-primary-600 text-lg font-semibold">
                Welcome to Span SportsHub! Stay tuned for updates and news coming soon.
              </div>
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