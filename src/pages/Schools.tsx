import React, { useEffect, useState } from 'react';
import { School, getSchools } from '../services/firebaseService';

const Schools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        setError('');
        const schoolsData = await getSchools();
        setSchools(schoolsData);
        setRetryCount(0); // Reset retry count on success
      } catch (error: any) {
        console.error('Error loading schools:', error);
        const errorMessage = error.message || 'Failed to load schools. Please try again later.';
        setError(errorMessage);
        
        // Auto-retry on network errors
        if (retryCount < 3 && (errorMessage.includes('network') || errorMessage.includes('unavailable'))) {
          console.log(`Retrying loadSchools (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadSchools();
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setLoading(true);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex flex-col items-center bg-cream-50 py-16 flex-1">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-primary-700 text-center mb-8">
            District 2 Schools
          </h1>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <div className="text-xl text-primary-600">Loading schools...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button
                onClick={handleRetry}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-primary-500 text-lg">No schools available yet.</div>
              <div className="text-primary-400 mt-2">Check back soon for updates!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {schools
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(school => (
                <div 
                  key={school.id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {school.logoUrl ? (
                        <img 
                          src={school.logoUrl} 
                          alt={`${school.name} logo`}
                          className="h-16 w-16 object-contain rounded-lg mr-4"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {!school.logoUrl && (
                        <div className="h-16 w-16 bg-primary-100 rounded-lg mr-4 flex items-center justify-center">
                          <span className="text-primary-500 text-xs font-medium">LOGO</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-700">{school.name}</h3>
                        <p className="text-primary-500">{school.location}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                         <span></span>
                         <a
                           href={`/schools/${school.id}`}
                           className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                         >
                           View School
                         </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Schools; 