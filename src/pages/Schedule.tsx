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
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolLogoMap, setSchoolLogoMap] = useState<Record<string, string>>({});
  const [selectedSchool, setSelectedSchool] = useState('');

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

  // Today's games - now includes upcoming games but excludes live games
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysGames = schedules.filter((game: any) => {
    const gameDate = game.time ? game.time.slice(0, 10) : '';
    const isToday = gameDate === todayStr;
    const isUpcoming = game.status && game.status.toUpperCase() === 'UPCOMING';
    const isLive = game.status && game.status.toUpperCase() === 'LIVE';
    return (isToday || isUpcoming) && !isLive && (selectedSport ? game.sport === selectedSport : true);
  });

  // Live games (status === 'LIVE')
  const liveGames = schedules.filter((game: any) => game.status && game.status.toUpperCase() === 'LIVE');

  // Helper to format time
  function formatTime(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-screen-2xl grid grid-cols-1 md:grid-cols-3 gap-24 justify-center mx-auto">
          {/* Box 1: Today's Games */}
          <div className="bg-white rounded-2xl shadow-2xl p-20 flex flex-col min-h-[600px] w-full max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-primary-700 mb-14">Today's Games</h2>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : todaysGames.length === 0 ? (
              <div className="text-primary-400 text-center">No games scheduled for today.</div>
            ) : (
              <div className="space-y-8">
                {todaysGames.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-2xl shadow-lg p-8 flex flex-col items-stretch hover:shadow-xl transition-shadow duration-300">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                      <div className="flex flex-col">
                        <div className="text-primary-700 font-semibold text-3xl mb-2">{formatTime(game.time)}</div>
                        <div className="text-gray-600 text-lg">{game.location}</div>
                      </div>
                    </div>
                    
                    {/* Teams Section */}
                    <div className="flex flex-col lg:flex-row items-center justify-between py-8 border-t border-b border-primary-200">
                      {/* Home Team */}
                      <div className="flex flex-col items-center lg:items-start gap-4 flex-1 min-w-0 mb-6 lg:mb-0">
                        <div className="flex items-center gap-4">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                            <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-20 w-20 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                          <div className="flex flex-col">
                            <span className="font-bold text-2xl text-primary-600 break-words leading-tight text-center lg:text-left max-w-[150px]">{game.schoolName}</span>
                        {game.score && game.score.home && (
                              <span className="bg-green-100 px-4 py-2 rounded font-bold text-xl mt-2 text-center lg:text-left">{game.score.home.final ?? '-'}</span>
                        )}
                          </div>
                        </div>
                      </div>
                      
                      {/* VS Section */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-8 mb-6 lg:mb-0">
                        <span className="text-2xl text-primary-400 font-bold">VS</span>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex flex-col items-center lg:items-end gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-2xl text-primary-600 break-words leading-tight text-center lg:text-right max-w-[150px]">{game.opponent}</span>
                            {game.score && game.score.away && (
                              <span className="bg-green-100 px-4 py-2 rounded font-bold text-xl mt-2 text-center lg:text-right">{game.score.away.final ?? '-'}</span>
                            )}
                          </div>
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                              <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-20 w-20 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Play Button for Livestream */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Box 2: Live Games */}
          <div className="bg-white rounded-2xl shadow-2xl p-20 flex flex-col min-h-[600px] w-full max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-primary-700 mb-14">Live Games</h2>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : liveGames.length === 0 ? (
              <div className="text-primary-400 text-center">No live games right now.</div>
            ) : (
              <div className="space-y-8">
                {liveGames.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-2xl shadow-lg p-8 flex flex-col items-stretch border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-300">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                      <div className="flex flex-col">
                        <div className="text-primary-700 font-semibold text-3xl mb-2">{formatTime(game.time)}</div>
                        <div className="text-orange-600 text-lg font-bold uppercase mb-2">LIVE</div>
                        <div className="text-gray-600 text-lg">{game.location}</div>
                      </div>
                    </div>
                    
                    {/* Teams Section */}
                    <div className="flex flex-col lg:flex-row items-center justify-between py-8 border-t border-b border-primary-200">
                      {/* Home Team */}
                      <div className="flex flex-col items-center lg:items-start gap-4 flex-1 min-w-0 mb-6 lg:mb-0">
                        <div className="flex items-center gap-4">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                            <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-20 w-20 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                          <div className="flex flex-col">
                            <span className="font-bold text-2xl text-primary-600 break-words leading-tight text-center lg:text-left max-w-[150px]">{game.schoolName}</span>
                        {game.score && game.score.home && (
                              <span className="bg-green-100 px-4 py-2 rounded font-bold text-xl mt-2 text-center lg:text-left">{game.score.home.final ?? '-'}</span>
                        )}
                          </div>
                        </div>
                      </div>
                      
                      {/* VS Section */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-8 mb-6 lg:mb-0">
                        <span className="text-2xl text-primary-400 font-bold">VS</span>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex flex-col items-center lg:items-end gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-2xl text-primary-600 break-words leading-tight text-center lg:text-right max-w-[150px]">{game.opponent}</span>
                            {game.score && game.score.away && (
                              <span className="bg-green-100 px-4 py-2 rounded font-bold text-xl mt-2 text-center lg:text-right">{game.score.away.final ?? '-'}</span>
                            )}
                          </div>
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                              <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-20 w-20 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Play Button for Livestream */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Box 3: Find a Game */}
          <div className="bg-white rounded-2xl shadow-2xl p-20 flex flex-col min-h-[600px] w-full max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-primary-700 mb-14">Find a Game</h2>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 items-center w-full">
              <div>
                <label className="font-semibold mr-2">Sport:</label>
                <select
                  value={selectedSport}
                  onChange={e => setSelectedSport(e.target.value)}
                  className="border border-primary-200 rounded px-3 py-2"
                >
                  <option value="">All Sports</option>
                  {availableSports.map(sport => (
                    <option key={sport} value={sport}>{sport.charAt(0).toUpperCase() + sport.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold mr-2">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border border-primary-200 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold mr-2">School:</label>
                <select
                  value={selectedSchool}
                  onChange={e => setSelectedSchool(e.target.value)}
                  className="border border-primary-200 rounded px-3 py-2"
                >
                  <option value="">All Schools</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Filtered Schedule Cards */}
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center text-primary-400 py-8">No games scheduled.</div>
            ) : (
              <div className="space-y-8">
                {filteredSchedules.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-2xl shadow-lg p-8 flex flex-col items-stretch hover:shadow-xl transition-shadow duration-300">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6">
                      <div className="flex flex-col">
                        <div className="text-primary-700 font-semibold text-3xl mb-2">{formatTime(game.time)}</div>
                        <div className="text-gray-600 text-lg">{game.location}</div>
                      </div>
                    </div>
                    
                    {/* Teams Section */}
                    <div className="flex flex-col lg:flex-row items-center justify-between py-8 border-t border-b border-primary-200">
                      {/* Home Team */}
                      <div className="flex flex-col items-center lg:items-start gap-4 flex-1 min-w-0 mb-6 lg:mb-0">
                        <div className="flex items-center gap-4">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                            <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-20 w-20 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                          <div className="flex flex-col">
                            <span className="font-bold text-2xl text-primary-600 break-words leading-tight text-center lg:text-left max-w-[150px]">{game.schoolName}</span>
                        {game.score && game.score.home && (
                              <span className="bg-green-100 px-4 py-2 rounded font-bold text-xl mt-2 text-center lg:text-left">{game.score.home.final ?? '-'}</span>
                        )}
                          </div>
                        </div>
                      </div>
                      
                      {/* VS Section */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-8 mb-6 lg:mb-0">
                        <span className="text-2xl text-primary-400 font-bold">VS</span>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex flex-col items-center lg:items-end gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-2xl text-primary-600 break-words leading-tight text-center lg:text-right max-w-[150px]">{game.opponent}</span>
                            {game.score && game.score.away && (
                              <span className="bg-green-100 px-4 py-2 rounded font-bold text-xl mt-2 text-center lg:text-right">{game.score.away.final ?? '-'}</span>
                            )}
                          </div>
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                              <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-20 w-20 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Play Button for Livestream */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={() => window.open(game.url || 'https://example.com/stream', '_blank')}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
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