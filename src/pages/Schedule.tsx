import Footer from '../components/Footer';

const Schedule = () => (
  <div className="min-h-screen bg-cream-50 flex flex-col">
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6">
        {/* Date */}
        <div className="text-gray-500 text-sm mb-2 font-semibold border-b pb-2">Wednesday, July 23, 2025</div>
        {/* Time & Location */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <div className="text-primary-700 font-medium">7:00 PM</div>
          <div className="text-gray-600 text-sm mt-1 sm:mt-0">John Henzes/Veterans Memorial Stadium, Peckville, PA</div>
        </div>
        {/* Teams and Play Button */}
        <div className="flex items-center justify-between py-4 border-t border-b">
          {/* City */}
          <div className="flex-1 text-xl font-bold text-primary-600 text-left">City</div>
          {/* Play Button */}
          <button
            aria-label="Watch Game"
            className="mx-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="none">
              <polygon points="9,7 19,12 9,17" fill="white" />
            </svg>
          </button>
          {/* County */}
          <div className="flex-1 text-xl font-bold text-primary-600 text-right">County</div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Schedule; 