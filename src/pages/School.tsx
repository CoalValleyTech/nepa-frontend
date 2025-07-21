import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSchools, School as BaseSchool } from '../services/firebaseService';

// Extend School type to include schedules
interface ScheduleEntry {
  location: string;
  time: string;
  opponent: string;
}
interface School extends BaseSchool {
  schedules?: {
    [sport: string]: ScheduleEntry[];
  };
}

// Default sport icons
const sportIcons: Record<string, string> = {
  football: '/default-football-helmet.png',
  tennis: '/default-tennis-racket.png',
};

const SchoolPage = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [allSchools, setAllSchools] = useState<School[]>([]);

  useEffect(() => {
    const fetchSchool = async () => {
      setLoading(true);
      setError('');
      try {
        const schools = await getSchools();
        setAllSchools(schools);
        const found = schools.find(s => s.id === id);
        if (found) {
          setSchool(found);
        } else {
          setError('School not found.');
        }
      } catch (e) {
        setError('Failed to load school.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
    // Optionally, add a reload button for manual refresh:
    // <button onClick={fetchSchool}>Reload</button>
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-cream-50">
        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-xl text-primary-600">Loading school...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        ) : school ? (
          <div className="container mx-auto px-4 py-8">
            {/* Header Section with Logo, Name, and Location */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-start space-x-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {school.logoUrl ? (
                    <img 
                      src={school.logoUrl} 
                      alt={school.name + ' logo'} 
                      className="h-24 w-24 object-contain rounded-lg shadow-md" 
                    />
                  ) : (
                    <div className="h-24 w-24 bg-primary-100 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-primary-500 text-sm font-medium">LOGO</span>
                    </div>
                  )}
                </div>
                
                {/* School Info */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-primary-700 mb-2">{school.name}</h1>
                  <div className="text-xl text-primary-500">{school.location}</div>
                </div>
              </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sports Sidebar */}
              <div className="lg:w-80">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-primary-600 mb-4">Sports</h2>
                  {school.sports && school.sports.length > 0 ? (
                    <div className="space-y-3">
                      {school.sports.map((sport, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSport(sport)}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium shadow-sm transition-colors border border-primary-200 focus:outline-none
                            ${selectedSport === sport ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                        >
                          <span className="text-lg">{sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-primary-400 text-lg mb-2">No sports added yet</div>
                      <div className="text-primary-300 text-sm">Sports will appear here when they are added to this school.</div>
                    </div>
                  )}
                </div>
              </div>
              {/* Main Content Area */}
              <div className="flex-1">
                {/* Schedule for selected sport */}
                {selectedSport && school.schedules && school.schedules[selectedSport] && school.schedules[selectedSport].length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-primary-600 mb-4">{selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Schedule</h2>
                    <ul className="space-y-3">
                      {school.schedules[selectedSport]
                        .slice()
                        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                        .map((game, idx) => {
                          // Find opponent school (if exists)
                          const opponentSchool = allSchools.find((s: any) => s.name === game.opponent);
                          const opponentLogo = opponentSchool?.logoUrl || sportIcons[selectedSport] || '/default-football-helmet.png';
                          return (
                            <li key={idx} className="flex flex-col md:flex-row md:items-center gap-2 bg-green-50 p-4 rounded-lg w-full shadow-sm border border-green-100">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* School Logo */}
                                {school.logoUrl ? (
                                  <img src={school.logoUrl} alt={school.name + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-green-200 flex-shrink-0" />
                                ) : (
                                  <img src={sportIcons[selectedSport] || '/default-football-helmet.png'} alt="Default logo" className="h-10 w-10 object-contain rounded bg-white border border-green-200 flex-shrink-0" />
                                )}
                                <span className="font-bold text-green-800 text-lg">{school.name}</span>
                                <span className="text-green-700 font-semibold mx-2">vs</span>
                                {/* Opponent Logo */}
                                <img src={opponentLogo} alt={game.opponent + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-green-200 flex-shrink-0" />
                                <span className="font-bold text-green-700 text-lg">{game.opponent}</span>
                                <span className="ml-4 text-green-600 font-medium">{game.time ? new Date(game.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                <span className="ml-2 text-green-600 font-medium">{game.time ? new Date(game.time).toLocaleDateString() : ''}</span>
                                <span className="ml-2 text-green-500 font-normal">| {game.location}</span>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : selectedSport ? (
                  <div className="bg-white rounded-xl shadow-lg p-6 text-primary-400">No games scheduled for this sport.</div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 text-primary-400">Select a sport to view the schedule.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SchoolPage; 