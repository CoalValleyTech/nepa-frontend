import { useEffect, useState } from 'react';
import { getGlobalSchedules, getSchools } from '../services/firebaseService';

const Schedule = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [_availableSports, setAvailableSports] = useState<string[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolLogoMap, setSchoolLogoMap] = useState<Record<string, string>>({});
  const [selectedSchool, setSelectedSchool] = useState('');

  // Sport navigation state
  const [activeSportTab, setActiveSportTab] = useState('all');

  // Define all available sports with their display names
  const allSports = [
    { value: 'all', label: 'All Sports', color: 'bg-primary-500' },
    { value: 'football', label: 'Football', color: 'bg-primary-500' },
    { value: 'golf-boys', label: "Men's Golf", color: 'bg-blue-600' },
    { value: 'golf-girls', label: "Women's Golf", color: 'bg-blue-500' },
    { value: 'boys-soccer', label: "Men's Soccer", color: 'bg-purple-600' },
    { value: 'girls-soccer', label: "Women's Soccer", color: 'bg-pink-600' },
    { value: 'boys-cross-country', label: "Men's Cross Country", color: 'bg-orange-600' },
    { value: 'girls-cross-country', label: "Women's Cross Country", color: 'bg-red-600' },
    { value: 'tennis', label: "Women's Tennis", color: 'bg-primary-500' }
  ];

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getGlobalSchedules();
        setSchedules(data);
        // Aggregate unique sports
        const sportsSet = new Set(data.map((g: any) => g.sport).filter(Boolean));
        setAvailableSports(Array.from(sportsSet));
      } catch (e) {
        setError('Failed to load schedules.');
      } finally {
        setLoading(false);
      }
    };
    const fetchSchools = async () => {
      try {
        const schoolsData = await getSchools();
        setSchools(schoolsData);
        const logoMap: Record<string, string> = {};
        for (const s of schoolsData) {
          if (s.id && s.logoUrl) logoMap[s.id] = s.logoUrl;
        }
        setSchoolLogoMap(logoMap);
      } catch {}
    };
    fetchSchedules();
    fetchSchools();
  }, []);

  // Filter schedules by selected sport and date
  const filteredSchedules = schedules.filter((game: any) => {
    const gameDate = game.time ? game.time.slice(0, 10) : '';
    const matchesSport = selectedSport ? game.sport === selectedSport : true;
    const matchesDate = selectedDate ? gameDate === selectedDate : true;
    const matchesSchool = selectedSchool ? (game.schoolId === selectedSchool || schools.find((s: any) => s.id === selectedSchool)?.name === game.opponent) : true;
    return matchesSport && matchesDate && matchesSchool;
  });

  // Today's games filtered by active sport tab
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysGames = schedules.filter((game: any) => {
    const gameDate = game.time ? game.time.slice(0, 10) : '';
    const isToday = gameDate === todayStr;
    const isUpcoming = game.status && game.status.toUpperCase() === 'UPCOMING';
    const isLive = game.status && game.status.toUpperCase() === 'LIVE';
    const matchesSport = activeSportTab === 'all' ? true : game.sport === activeSportTab;
    return (isToday || isUpcoming) && !isLive && matchesSport;
  });

  // Live games (status === 'LIVE')
  const liveGames = schedules.filter((game: any) => game.status && game.status.toUpperCase() === 'LIVE');

  // Helper to format time
  function formatTime(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Helper to get sport color
  const getSportColor = (sport: string) => {
    const sportObj = allSports.find(s => s.value === sport);
    return sportObj ? sportObj.color : 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-screen-2xl flex flex-col gap-4 sm:gap-8 justify-center mx-auto">
          
          {/* Box 1: Live Games - NOW THE FIRST AND MOST PROMINENT SECTION */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-4 sm:p-8 flex flex-col w-full max-w-4xl mx-auto border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl sm:text-4xl font-bold text-red-700">Live Games</h2>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                Loading live games...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : liveGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-red-600 text-lg mb-2 font-semibold">No live games right now</div>
                <div className="text-red-500 text-sm">Check back later for live action!</div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-700">
                    <strong>Tip:</strong> Live games appear here when they have a status of "LIVE" in the database.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {liveGames.map((game, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-stretch border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
                    {/* Live Game Header - Enhanced for prominence */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                      <div className="flex flex-col">
                        <div className="text-red-700 font-semibold text-xl mb-1">{formatTime(game.time)}</div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-600 text-sm font-bold uppercase">LIVE NOW</span>
                        </div>
                        <div className="text-gray-600 text-sm">{game.location}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSportColor(game.sport)}`}>
                        {game.sport?.charAt(0).toUpperCase() + game.sport?.slice(1)}
                      </div>
                    </div>
                    
                    {/* Teams Section - Enhanced for live games */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-t border-orange-200 gap-4">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 flex-1">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded bg-white border border-orange-200 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-base sm:text-lg text-primary-600">{game.schoolName}</span>
                          {game.score && game.score.home && (
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-bold">{game.score.home.final ?? '-'}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* VS Section */}
                      <div className="flex-shrink-0 text-center">
                        <span className="text-lg text-red-500 font-bold">VS</span>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-base sm:text-lg text-primary-600">{game.opponent}</span>
                          {game.score && game.score.away && (
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-bold">{game.score.away.final ?? '-'}</span>
                          )}
                        </div>
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded bg-white border border-orange-200 flex-shrink-0" />
                          ) : null;
                        })()}
                      </div>
                    </div>
                    
                    {/* Live Stream Button - Enhanced */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        title="Watch Live Stream"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Today's Games - Now second priority */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-4 sm:p-8 flex flex-col w-full max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold text-primary-700 mb-4 sm:mb-6">Today's Games</h2>
            
            {/* Sport Navigation Tabs */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {allSports.map((sport) => (
                  <button
                    key={sport.value}
                    onClick={() => setActiveSportTab(sport.value)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                      activeSportTab === sport.value
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Games for Selected Sport */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                Loading...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : todaysGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-primary-400 text-lg mb-2">
                  {activeSportTab === 'all' 
                    ? "No games scheduled for today." 
                    : `No ${allSports.find(s => s.value === activeSportTab)?.label} games scheduled for today.`
                  }
                </div>
                <div className="text-sm text-gray-500">
                  Try selecting a different sport or check back later.
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {todaysGames.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-xl shadow-lg p-6 flex flex-col items-stretch hover:shadow-xl transition-shadow duration-300">
                    {/* Game Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <div className="text-primary-700 font-semibold text-xl mb-1">{formatTime(game.time)}</div>
                        <div className="text-gray-600 text-sm">{game.location}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSportColor(game.sport)}`}>
                        {game.sport?.charAt(0).toUpperCase() + game.sport?.slice(1)}
                      </div>
                    </div>
                    
                    {/* Teams Section */}
                    <div className="flex items-center justify-between py-4 border-t border-primary-200">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 flex-1">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-primary-600">{game.schoolName}</span>
                          {game.score && game.score.home && (
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-bold">{game.score.home.final ?? '-'}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* VS Section */}
                      <div className="flex-shrink-0 mx-4">
                        <span className="text-lg text-primary-400 font-bold">VS</span>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-lg text-primary-600">{game.opponent}</span>
                          {game.score && game.score.away && (
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-bold">{game.score.away.final ?? '-'}</span>
                          )}
                        </div>
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                      </div>
                    </div>
                    
                    {/* Watch Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Watch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 3: Find a Game - Now third priority */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-4 sm:p-8 flex flex-col w-full max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold text-primary-700 mb-4 sm:mb-6">Find a Game</h2>
            
            {/* Enhanced Filters - Mobile Optimized */}
            <div className="mb-4 sm:mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">Sport</label>
                  <select
                    value={selectedSport}
                    onChange={e => setSelectedSport(e.target.value)}
                    className="w-full border border-primary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Sports</option>
                    {allSports.slice(1).map(sport => (
                      <option key={sport.value} value={sport.value}>{sport.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full border border-primary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-700 mb-2">School</label>
                  <select
                    value={selectedSchool}
                    onChange={e => setSelectedSchool(e.target.value)}
                    className="w-full border border-primary-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Schools</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filtered Schedule Cards */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                Loading...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-primary-400 text-lg mb-2">No games found.</div>
                <div className="text-sm text-gray-500">Try adjusting your filters.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedules.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-stretch hover:shadow-xl transition-shadow duration-300">
                    {/* Game Header - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                      <div className="flex flex-col">
                        <div className="text-primary-700 font-semibold text-xl mb-1">{formatTime(game.time)}</div>
                        <div className="text-gray-600 text-sm">{game.location}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSportColor(game.sport)}`}>
                        {game.sport?.charAt(0).toUpperCase() + game.sport?.slice(1)}
                      </div>
                    </div>
                    
                    {/* Teams Section - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-t border-primary-200 gap-4">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 flex-1">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-base sm:text-lg text-primary-600">{game.schoolName}</span>
                          {game.score && game.score.home && (
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-bold">{game.score.home.final ?? '-'}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* VS Section */}
                      <div className="flex-shrink-0 text-center">
                        <span className="text-lg text-primary-400 font-bold">VS</span>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-base sm:text-lg text-primary-600">{game.opponent}</span>
                          {game.score && game.score.away && (
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-bold">{game.score.away.final ?? '-'}</span>
                          )}
                        </div>
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                      </div>
                    </div>
                    
                    {/* Game Notes Display */}
                    {game.notes && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-xs text-blue-700 font-semibold mb-1">Game Notes:</div>
                        <div className="text-sm text-blue-800">{game.notes}</div>
                      </div>
                    )}
                    
                    {/* Watch Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Watch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedule; 