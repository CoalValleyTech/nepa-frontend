import Footer from '../components/Footer';
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
    return matchesSport && matchesDate;
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
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Box 1: Today's Games */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-primary-700 mb-4">Today's Games</h2>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : todaysGames.length === 0 ? (
              <div className="text-primary-400 text-center">No games scheduled for today.</div>
            ) : (
              <div className="space-y-6">
                {todaysGames.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col items-stretch">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <div className="text-primary-700 font-medium">{formatTime(game.time)}</div>
                      <div className="text-gray-600 text-sm mt-1 sm:mt-0">{game.location}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-b">
                      {/* Home/School */}
                      <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                        )}
                        <span className="truncate max-w-[90px]">{game.schoolName}</span>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-2">
                        <span className="text-xs text-primary-400">VS</span>
                      </div>
                      {/* Opponent */}
                      <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600 justify-end">
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                          ) : null;
                        })()}
                        <span className="truncate max-w-[90px] text-right">{game.opponent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Box 2: Live Games */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-primary-700 mb-4">Live Games</h2>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : liveGames.length === 0 ? (
              <div className="text-primary-400 text-center">No live games right now.</div>
            ) : (
              <div className="space-y-6">
                {liveGames.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col items-stretch border-l-4 border-orange-500">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <div className="text-primary-700 font-medium">{formatTime(game.time)}</div>
                      <div className="text-orange-600 text-xs font-bold uppercase">LIVE</div>
                      <div className="text-gray-600 text-sm mt-1 sm:mt-0">{game.location}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-b">
                      {/* Home/School */}
                      <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                        )}
                        <span className="truncate max-w-[90px]">{game.schoolName}</span>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-2">
                        <span className="text-xs text-primary-400">VS</span>
                      </div>
                      {/* Opponent */}
                      <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600 justify-end">
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                          ) : null;
                        })()}
                        <span className="truncate max-w-[90px] text-right">{game.opponent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Box 3: Find a Game */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-primary-700 mb-4">Find a Game</h2>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
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
            </div>
            {/* Filtered Schedule Cards */}
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center text-primary-400 py-8">No games scheduled.</div>
            ) : (
              <div className="space-y-6">
                {filteredSchedules.map((game, idx) => (
                  <div key={idx} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col items-stretch">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <div className="text-primary-700 font-medium">{formatTime(game.time)}</div>
                      <div className="text-gray-600 text-sm mt-1 sm:mt-0">{game.location}</div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-b">
                      {/* Home/School */}
                      <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600">
                        {game.schoolId && schoolLogoMap[game.schoolId] && (
                          <img src={schoolLogoMap[game.schoolId]} alt={game.schoolName + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                        )}
                        <span className="truncate max-w-[90px]">{game.schoolName}</span>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center justify-center mx-2">
                        <span className="text-xs text-primary-400">VS</span>
                      </div>
                      {/* Opponent */}
                      <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600 justify-end">
                        {(() => {
                          const opp = schools.find((s: any) => s.name === game.opponent);
                          return opp && opp.logoUrl ? (
                            <img src={opp.logoUrl} alt={game.opponent + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                          ) : null;
                        })()}
                        <span className="truncate max-w-[90px] text-right">{game.opponent}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule; 