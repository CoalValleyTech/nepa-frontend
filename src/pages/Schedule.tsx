import { useEffect, useState } from 'react';
import { getGlobalSchedules, getSchools } from '../services/firebaseService';

const Schedule = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [_availableSports, setAvailableSports] = useState<string[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolLogoMap, setSchoolLogoMap] = useState<Record<string, string>>({});

  // Sport navigation state
  const [activeSportTab, setActiveSportTab] = useState('all');

  // Define all available sports with their display names
  const allSports = [
    { value: 'all', label: 'All Sports', color: 'bg-green-800' },
    { value: 'football', label: 'Football', color: 'bg-green-800' },
    { value: 'golf-boys', label: "Men's Golf", color: 'bg-green-800' },
    { value: 'golf-girls', label: "Women's Golf", color: 'bg-green-800' },
    { value: 'boys-soccer', label: "Men's Soccer", color: 'bg-green-800' },
    { value: 'girls-soccer', label: "Women's Soccer", color: 'bg-green-800' },
    { value: 'boys-cross-country', label: "Men's Cross Country", color: 'bg-green-800' },
    { value: 'girls-cross-country', label: "Women's Cross Country", color: 'bg-green-800' },
    { value: 'tennis', label: "Women's Tennis", color: 'bg-green-800' }
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
    <div className="min-h-screen bg-cream-50">
      <main className="w-full px-2 sm:px-4 py-4 sm:py-8">
        <div className="w-full">
          {/* 50/50 Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
            
            {/* Left Side: Sportsboard (Live Games) - 50% */}
            <div className="bg-green-800 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col">
              {/* Sportsboard Header with Span Logo */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <img src="/span-logo.png" alt="Span Logo" className="h-8 w-8 object-contain" />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Sportsboard</h2>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <div className="text-white">Loading live games...</div>
                </div>
              ) : error ? (
                <div className="text-center text-red-200 py-8">{error}</div>
              ) : liveGames.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white text-lg mb-2 font-semibold">No live games right now</div>
                  <div className="text-green-100 text-sm">Check back later for live action!</div>
                  <div className="mt-4 p-3 bg-green-700 rounded-lg border border-green-600">
                    <p className="text-xs text-green-100">
                      <strong>Tip:</strong> Live games appear here when they have a status of "LIVE" in the database.
                    </p>
                  </div>
                </div>
              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 overflow-y-auto">
                  {liveGames.map((game, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-lg p-3 sm:p-4 flex flex-col border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300 min-w-0">
                      {/* Game Header Row */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-600 text-xs font-bold uppercase tracking-wide">LIVE</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSportColor(game.sport)}`}>
                          {game.sport?.charAt(0).toUpperCase() + game.sport?.slice(1)}
                        </div>
                      </div>

                      {/* Time and Location */}
                      <div className="mb-4">
                        <div className="text-red-700 font-bold text-xl mb-1">{formatTime(game.time)}</div>
                        <div className="text-gray-600 text-sm">{game.location}</div>
                      </div>

                      {/* Teams and Scores - Side by Side */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Home Team */}
                        <div className="flex flex-col items-center text-center flex-1">
                          {game.schoolId && schoolLogoMap[game.schoolId] && (
                            <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-gray-200 mb-2" />
                          )}
                          <span className="font-bold text-sm text-gray-800 mb-2 text-center leading-tight">{game.schoolName}</span>
                          {game.score && game.score.home ? (
                            <span className="bg-green-100 px-3 py-1 rounded-full text-lg font-bold text-green-800">{game.score.home.final ?? '-'}</span>
                          ) : (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-lg font-bold text-gray-600">-</span>
                          )}
                        </div>

                        {/* VS Separator */}
                        <div className="mx-4 text-center">
                          <div className="text-red-500 font-bold text-lg mb-1">VS</div>
                          <div className="text-red-400 text-xs">LIVE</div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center text-center flex-1">
                          {(() => {
                            const opp = schools.find((s: any) => s.name === game.opponent);
                            return opp && opp.logoUrl ? (
                              <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-gray-200 mb-2" />
                            ) : null;
                          })()}
                          <span className="font-bold text-sm text-gray-800 mb-2 text-center leading-tight">{game.opponent}</span>
                          {game.score && game.score.away ? (
                            <span className="bg-green-100 px-3 py-1 rounded-full text-lg font-bold text-green-800">{game.score.away.final ?? '-'}</span>
                          ) : (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-lg font-bold text-gray-600">-</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Live Stream Button */}
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          title="Watch Live Stream"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Today's Games - 50% */}
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-700 mb-4 sm:mb-6">Today's Games</h2>
              
              {/* Sport Navigation Tabs */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {allSports.map((sport) => (
                    <button
                      key={sport.value}
                      onClick={() => setActiveSportTab(sport.value)}
                                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeSportTab === sport.value
                        ? 'bg-green-800 text-white shadow-lg'
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
                  <div className="text-gray-600">Loading...</div>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 overflow-y-auto">
                  {todaysGames.map((game, idx) => (
                    <div key={idx} className="bg-primary-50 rounded-xl shadow-xl p-3 sm:p-4 flex flex-col border-l-4 border-primary-300 hover:shadow-xl transition-shadow duration-300 min-w-0">
                      {/* Game Header Row */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-primary-600 text-xs font-semibold">SCHEDULED</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSportColor(game.sport)}`}>
                          {game.sport?.charAt(0).toUpperCase() + game.sport?.slice(1)}
                        </div>
                      </div>

                      {/* Time and Location */}
                      <div className="mb-4">
                        <div className="text-primary-700 font-bold text-xl mb-1">{formatTime(game.time)}</div>
                        <div className="text-gray-600 text-sm">{game.location}</div>
                      </div>

                      {/* Teams and Scores - Side by Side */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Home Team */}
                        <div className="flex flex-col items-center text-center flex-1">
                          {game.schoolId && schoolLogoMap[game.schoolId] && (
                            <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200 mb-2" />
                          )}
                          <span className="font-bold text-sm text-primary-600 mb-2 text-center leading-tight">{game.schoolName}</span>
                          {game.score && game.score.home ? (
                            <span className="bg-green-100 px-3 py-1 rounded-full text-lg font-bold text-green-800">{game.score.home.final ?? '-'}</span>
                          ) : (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-lg font-bold text-gray-600">-</span>
                          )}
                        </div>

                        {/* VS Separator */}
                        <div className="mx-4 text-center">
                          <div className="text-primary-400 font-bold text-lg mb-1">VS</div>
                          <div className="text-primary-300 text-xs">UPCOMING</div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center text-center flex-1">
                          {(() => {
                            const opp = schools.find((s: any) => s.name === game.opponent);
                            return opp && opp.logoUrl ? (
                              <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200 mb-2" />
                            ) : null;
                          })()}
                          <span className="font-bold text-sm text-primary-600 mb-2 text-center leading-tight">{game.opponent}</span>
                          {game.score && game.score.away ? (
                            <span className="bg-green-100 px-3 py-1 rounded-full text-lg font-bold text-green-800">{game.score.away.final ?? '-'}</span>
                          ) : (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-lg font-bold text-gray-600">-</span>
                          )}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedule; 