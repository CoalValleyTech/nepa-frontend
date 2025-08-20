import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSchools, School as BaseSchool } from '../services/firebaseService';

// Extend School type to include schedules
interface ScheduleEntry {
  location: string;
  time: string;
  opponent: string;
  status?: string;
  score?: {
    home?: {
      final?: number;
      [key: string]: number | undefined;
    };
    away?: {
      final?: number;
      [key: string]: number | undefined;
    };
  };
  notes?: string;
}
interface School extends BaseSchool {
  schedules?: {
    [sport: string]: ScheduleEntry[];
  };
  rosters?: {
    [sport: string]: {
      [season: string]: {
        sport: string;
        season: string;
        players: any[];
      };
    };
  };
}

// Default sport icons
const sportIcons: Record<string, string> = {
  football: '/default-football-helmet.png',
  tennis: '/default-tennis-racket.png',
  'tennis-women': '/default-tennis-racket.png',
  'cross-country-boys': '/default-running.png',
  'cross-country-girls': '/default-running.png',
  'field-hockey': '/default-field-hockey.png',
  'golf-boys': '/default-golf.png',
  'golf-girls': '/default-golf.png',
  'soccer-boys': '/default-soccer.png',
  'soccer-girls': '/default-soccer.png',
  volleyball: '/default-volleyball.png',
};

// Helper function to format sport names
const formatSportName = (sport: string): string => {
  const sportNameMap: Record<string, string> = {
    'football': 'Football',
    'tennis': 'Tennis',
    'tennis-women': "Women's Tennis",
    'golf-boys': "Men's Golf",
    'golf-girls': "Women's Golf",
    'boys-soccer': "Men's Soccer",
    'girls-soccer': "Women's Soccer",
    'boys-cross-country': "Men's Cross Country",
    'girls-cross-country': "Women's Cross Country",
    'cross-country-boys': "Men's Cross Country",
    'cross-country-girls': "Women's Cross Country",
    'soccer-boys': "Men's Soccer",
    'soccer-girls': "Women's Soccer",
    'volleyball': 'Volleyball',
    'field-hockey': 'Field Hockey'
  };
  
  return sportNameMap[sport] || sport.charAt(0).toUpperCase() + sport.slice(1);
};

const SchoolPage = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [allSchools, setAllSchools] = useState<any[]>([]);

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
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-primary-700 mb-2 break-words leading-tight">{school.name}</h1>
                  <div className="text-xl text-primary-500 break-words leading-tight">{school.location}</div>
                </div>
              </div>
            </div>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sports Sidebar */}
              <div className="lg:w-80">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold text-primary-600 mb-4 break-words leading-tight">Sports</h2>
                  {school.sports && school.sports.length > 0 ? (
                    <div className="space-y-3">
                      {school.sports.map((sport, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSport(sport)}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium shadow-sm transition-colors border border-primary-200 focus:outline-none
                            ${selectedSport === sport ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                        >
                          <span className="text-lg break-words leading-tight">{formatSportName(sport)}</span>
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
                {!selectedSport ? (
                  /* Default state when no sport is selected */
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center py-12">
                      <div className="text-primary-400 text-xl mb-4">Select a Sport</div>
                      <div className="text-primary-300 text-lg">Choose a sport from the sidebar to view its schedule and game information.</div>
                    </div>
                  </div>
                ) : (
                  /* Selected Sport with Side-by-Side Schedule and Roster */
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-primary-600 mb-6 break-words leading-tight">
                      {formatSportName(selectedSport)}
                    </h2>
                    
                    {/* 2x2 Grid Layout for Schedule, Roster, Stats, and News */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Schedule Section - Top Left */}
                      <div className="space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-semibold text-primary-600 border-b-2 border-primary-200 pb-2">
                          Schedule
                        </h3>
                        
                        {school.schedules && school.schedules[selectedSport] && school.schedules[selectedSport].length > 0 ? (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {school.schedules[selectedSport]
                              .slice()
                              .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                              .map((game, idx) => {
                                // Find opponent school (if exists)
                                const opponentSchool = allSchools.find((s: any) => s.name === game.opponent);
                                const opponentLogo = opponentSchool?.logoUrl || sportIcons[selectedSport] || '/default-football-helmet.png';
                                return (
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-primary-200 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Teams Section */}
                                    <div className="flex items-center gap-3 mb-3">
                                      {/* School Logo */}
                                      {school.logoUrl ? (
                                        <img src={school.logoUrl} alt={school.name + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                                      ) : (
                                        <img src={sportIcons[selectedSport] || '/default-football-helmet.png'} alt="Default logo" className="h-12 w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                                      )}
                                      <span className="font-bold text-primary-800 text-lg break-words leading-tight">{school.name}</span>
                                      <span className="text-primary-600 font-semibold mx-2 flex-shrink-0">vs</span>
                                      {/* Opponent Logo */}
                                      <img src={opponentLogo} alt={game.opponent + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200 flex-shrink-0" />
                                      <span className="font-bold text-primary-700 text-lg break-words leading-tight">{game.opponent}</span>
                                    </div>
                                    
                                    {/* Game Details Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-primary-600 font-medium">
                                            {game.time ? new Date(game.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                          </span>
                                          <span className="text-primary-600 font-medium">
                                            {game.time ? new Date(game.time).toLocaleDateString() : ''}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-primary-500 font-normal break-words leading-tight">📍 {game.location}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Score Display */}
                                      {game.score && (game.score.home?.final || game.score.away?.final) && (
                                        <div className="flex flex-col items-end">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-primary-700 text-xl">
                                              {game.score.home?.final ?? '-'} - {game.score.away?.final ?? '-'}
                                            </span>
                                            {game.status && (
                                              <span className={`text-xs px-2 py-1 rounded-full ${
                                                game.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                                                game.status === 'FINAL' ? 'bg-green-100 text-green-700' :
                                                'bg-yellow-100 text-yellow-700'
                                              }`}>
                                                {game.status}
                                              </span>
                                            )}
                                          </div>
                                          {/* Period Scores */}
                                          {game.score?.home && game.score?.away && (
                                            <div className="flex gap-2 text-xs text-gray-600">
                                              {['1', '2', '3', '4'].map(period => (
                                                <span key={period} className="px-2 py-1 bg-gray-50 rounded border border-primary-200">
                                                  {period}: {game.score?.home?.[period] || '-'}/{game.score?.away?.[period] || '-'}
                                                </span>
                                              ))}
                                              {game.score?.home?.OT && game.score?.away?.OT && (
                                                <span className="px-2 py-1 bg-gray-50 rounded border border-orange-200 text-orange-600 font-semibold">
                                                  OT: {game.score.home.OT}/{game.score.away.OT}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Game Notes Display */}
                                    {game.notes && (
                                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="text-xs text-blue-700 font-semibold mb-1">Game Notes:</div>
                                        <div className="text-sm text-blue-800">{game.notes}</div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-lg mb-2 text-gray-500">No games scheduled for {formatSportName(selectedSport)}</div>
                            <div className="text-sm text-gray-400">Check back later for upcoming games.</div>
                          </div>
                        )}
                      </div>

                      {/* Roster Section - Top Right */}
                      <div className="space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-semibold text-primary-600 border-b-2 border-primary-200 pb-2">
                          Roster
                        </h3>
                        
                        {selectedSport && school.rosters && school.rosters[selectedSport] ? (
                          <div className="space-y-6">
                            {Object.entries(school.rosters[selectedSport])
                              .filter(([_season, rosterData]: [string, any]) => 
                                rosterData.players && rosterData.players.length > 0
                              )
                              .map(([season, rosterData]: [string, any]) => (
                                <div key={season} className="bg-white rounded-lg border border-primary-200 p-4 shadow-sm">
                                  <h4 className="text-lg font-semibold text-primary-700 mb-4 text-center">{season} Season</h4>
                                  <div className="bg-gray-50 rounded-lg border border-primary-200 overflow-hidden">
                                    <div className="grid grid-cols-4 gap-0 border-b border-primary-200 bg-primary-100">
                                      <div className="px-3 py-3 font-semibold text-primary-800 text-sm text-center">#</div>
                                      <div className="px-3 py-3 font-semibold text-primary-800 text-sm">Name</div>
                                      <div className="px-3 py-3 font-semibold text-primary-800 text-sm">Position</div>
                                      <div className="px-3 py-3 font-semibold text-primary-800 text-sm text-center">Grade</div>
                                    </div>
                                    <div className="divide-y divide-primary-100 max-h-96 overflow-y-auto">
                                      {rosterData.players.map((player: any, idx: number) => (
                                        <div key={idx} className="grid grid-cols-4 gap-0 hover:bg-primary-50 transition-colors">
                                          <div className="px-3 py-3 font-bold text-primary-700 text-sm text-center">
                                            {player.number}
                                          </div>
                                          <div className="px-3 py-3 font-semibold text-primary-800 text-sm">
                                            {player.name}
                                          </div>
                                          <div className="px-3 py-3 text-primary-600 text-sm">
                                            {player.position}
                                          </div>
                                          <div className="px-3 py-3 text-primary-600 text-sm text-center">
                                            {player.grade}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {Object.entries(school.rosters[selectedSport]).filter(([_season, rosterData]: [string, any]) => 
                              rosterData.players && rosterData.players.length > 0
                            ).length === 0 && (
                              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-lg mb-2 text-gray-500">No roster available for {formatSportName(selectedSport)}</div>
                                <div className="text-sm text-gray-400">Roster information will appear here when available.</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-lg mb-2 text-gray-500">No roster available for {formatSportName(selectedSport)}</div>
                            <div className="text-sm text-gray-400">Roster information will appear here when available.</div>
                          </div>
                        )}
                      </div>

                      {/* Stats Section - Bottom Left */}
                      <div className="space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-semibold text-primary-600 border-b-2 border-primary-200 pb-2">
                          Stats
                        </h3>
                        
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-lg mb-2 text-gray-500">Stats coming soon</div>
                          <div className="text-sm text-gray-400">Team and player statistics will be displayed here.</div>
                        </div>
                      </div>

                      {/* News Section - Bottom Right */}
                      <div className="space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-semibold text-primary-600 border-b-2 border-primary-200 pb-2">
                          News
                        </h3>
                        
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-lg mb-2 text-gray-500">News coming soon</div>
                          <div className="text-sm text-gray-400">Latest news and updates will be displayed here.</div>
                        </div>
                      </div>
                    </div>
                  </div>
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