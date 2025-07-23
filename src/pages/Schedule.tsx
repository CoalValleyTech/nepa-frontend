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

  // Today's games
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysGames = schedules.filter((game: any) => {
    const gameDate = game.time ? game.time.slice(0, 10) : '';
    return gameDate === todayStr && (selectedSport ? game.sport === selectedSport : true);
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
                  <div key={idx} className="bg-primary-50 rounded-2xl shadow p-6 flex flex-col items-stretch">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                      <div className="text-primary-700 font-semibold text-xl">{formatTime(game.time)}</div>
                      <div className="text-gray-600 text-base mt-1 sm:mt-0">{game.location}</div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-b">
                      {/* Home/School */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                        <span className="font-bold text-xl text-primary-600 break-words leading-tight">{game.schoolName}</span>
                        {game.score && game.score.home && (
                          <span className="bg-green-100 px-3 py-1 rounded font-bold text-lg ml-2 flex-shrink-0">{game.score.home.final ?? '-'}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-4">
                        <span className="text-lg text-primary-400">VS</span>
                      </div>
                      {/* Opponent */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                        <span className="font-bold text-xl text-primary-600 break-words leading-tight text-right">{game.opponent}</span>
                        {game.score && game.score.away && (
                          <span className="bg-green-100 px-3 py-1 rounded font-bold text-lg ml-2 flex-shrink-0">{game.score.away.final ?? '-'}</span>
                        )}
                      </div>
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
                  <div key={idx} className="bg-primary-50 rounded-2xl shadow p-6 flex flex-col items-stretch border-l-4 border-orange-500">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                      <div className="text-primary-700 font-semibold text-xl">{formatTime(game.time)}</div>
                      <div className="text-orange-600 text-base font-bold uppercase">LIVE</div>
                      <div className="text-gray-600 text-base mt-1 sm:mt-0">{game.location}</div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-b">
                      {/* Home/School */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                        <span className="font-bold text-xl text-primary-600 break-words leading-tight">{game.schoolName}</span>
                        {game.score && game.score.home && (
                          <span className="bg-green-100 px-3 py-1 rounded font-bold text-lg ml-2 flex-shrink-0">{game.score.home.final ?? '-'}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-4">
                        <span className="text-lg text-primary-400">VS</span>
                      </div>
                      {/* Opponent */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                        <span className="font-bold text-xl text-primary-600 break-words leading-tight text-right">{game.opponent}</span>
                        {game.score && game.score.away && (
                          <span className="bg-green-100 px-3 py-1 rounded font-bold text-lg ml-2 flex-shrink-0">{game.score.away.final ?? '-'}</span>
                        )}
                      </div>
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
                  <div key={idx} className="bg-primary-50 rounded-2xl shadow p-6 flex flex-col items-stretch">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                      <div className="text-primary-700 font-semibold text-xl">{formatTime(game.time)}</div>
                      <div className="text-gray-600 text-base mt-1 sm:mt-0">{game.location}</div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t border-b">
                      {/* Home/School */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                        )}
                        <span className="font-bold text-xl text-primary-600 break-words leading-tight">{game.schoolName}</span>
                        {game.score && game.score.home && (
                          <span className="bg-green-100 px-3 py-1 rounded font-bold text-lg ml-2 flex-shrink-0">{game.score.home.final ?? '-'}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-4">
                        <span className="text-lg text-primary-400">VS</span>
                      </div>
                      {/* Opponent */}
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                          ) : null;
                        })()}
                        <span className="font-bold text-xl text-primary-600 break-words leading-tight text-right">{game.opponent}</span>
                        {game.score && game.score.away && (
                          <span className="bg-green-100 px-3 py-1 rounded font-bold text-lg ml-2 flex-shrink-0">{game.score.away.final ?? '-'}</span>
                        )}
                      </div>
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