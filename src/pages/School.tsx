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
  gameNotes?: {
    homeTeamNotes?: string;
    awayTeamNotes?: string;
    generalNotes?: string;
  };
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

// Helper function to calculate overall record for a sport
const calculateOverallRecord = (games: ScheduleEntry[]): { wins: number; losses: number; ties: number; record: string } => {
  let wins = 0;
  let losses = 0;
  let ties = 0;

  games.forEach(game => {
    if (game.status === 'FINAL' && game.score?.home?.final !== undefined && game.score?.away?.final !== undefined) {
      if (game.score.home.final > game.score.away.final) {
        wins++;
      } else if (game.score.home.final < game.score.away.final) {
        losses++;
      } else {
        ties++;
      }
    }
  });

  const record = `${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`;
  return { wins, losses, ties, record };
};

const SchoolPage = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [allSchools, setAllSchools] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<ScheduleEntry | null>(null);
  const [showGameNotesModal, setShowGameNotesModal] = useState(false);

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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-primary-600 break-words leading-tight">
                        {formatSportName(selectedSport)}
                      </h2>
                      {school.schedules && school.schedules[selectedSport] && school.schedules[selectedSport].length > 0 && (
                        (() => {
                          const record = calculateOverallRecord(school.schedules[selectedSport]);
                          return record.wins > 0 || record.losses > 0 || record.ties > 0 ? (
                            <div className="mt-2 sm:mt-0">
                              <div className="text-sm text-gray-600 mb-1">Overall Record</div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-primary-700">{record.record}</span>
                                <div className="flex gap-1 text-xs">
                                  {record.wins > 0 && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                      {record.wins}W
                                    </span>
                                  )}
                                  {record.losses > 0 && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                      {record.losses}L
                                    </span>
                                  )}
                                  {record.ties > 0 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                                      {record.ties}T
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()
                      )}
                    </div>
                    
                    {/* 2x2 Grid Layout for Schedule, Roster, Stats, and News */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Schedule Section - Top Left */}
                      <div className="space-y-4 min-h-[400px]">
                        <h3 className="text-xl font-semibold text-primary-600 border-b-2 border-primary-200 pb-2">
                          Schedule
                        </h3>
                        
                        {school.schedules && school.schedules[selectedSport] && school.schedules[selectedSport].length > 0 ? (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(() => {
                              // Remove duplicates and sort games
                              const uniqueGames = school.schedules[selectedSport]
                                .slice()
                                .filter((game, index, self) => 
                                  index === self.findIndex(g => 
                                    g.time === game.time && 
                                    g.opponent === game.opponent && 
                                    g.location === game.location
                                  )
                                )
                                .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
                              
                              return uniqueGames.map((game, idx) => {
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
                                            {/* Win/Loss Indicator */}
                                            {game.status === 'FINAL' && game.score.home?.final !== undefined && game.score.away?.final !== undefined && (
                                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                game.score.home.final > game.score.away.final 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : game.score.home.final < game.score.away.final 
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                              }`}>
                                                {game.score.home.final > game.score.away.final ? 'W' : 
                                                 game.score.home.final < game.score.away.final ? 'L' : 'T'}
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
                                    
                                    {/* Game Notes Button */}
                                    <div className="mt-3 flex justify-end">
                                      <button
                                        onClick={() => {
                                          setSelectedGame(game);
                                          setShowGameNotesModal(true);
                                        }}
                                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                      >
                                        Game Notes
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
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

      {/* Game Notes Modal */}
      {showGameNotesModal && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-700">Game Notes & Box Score</h3>
                <button
                  onClick={() => setShowGameNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Game Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {school?.logoUrl && (
                      <img src={school.logoUrl} alt={school.name + ' logo'} className="h-12 w-12 object-contain rounded" />
                    )}
                    <span className="font-bold text-lg text-primary-800">{school?.name}</span>
                    <span className="text-primary-600 font-semibold">vs</span>
                    <span className="font-bold text-lg text-primary-800">{selectedGame.opponent}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {selectedGame.time ? new Date(selectedGame.time).toLocaleDateString() : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedGame.time ? new Date(selectedGame.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                    <div className="text-sm text-gray-600">📍 {selectedGame.location}</div>
                  </div>
                </div>
                
                {/* Final Score */}
                {selectedGame.score && (selectedGame.score.home?.final || selectedGame.score.away?.final) && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-700 mb-2">
                      {selectedGame.score.home?.final ?? '-'} - {selectedGame.score.away?.final ?? '-'}
                    </div>
                    {selectedGame.status && (
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        selectedGame.status === 'FINAL' ? 'bg-green-100 text-green-700' :
                        selectedGame.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedGame.status}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Box Score */}
              {selectedGame.score && (selectedGame.score.home || selectedGame.score.away) && (
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-primary-600 mb-4">Box Score</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 gap-0">
                      {/* Header */}
                      <div className="bg-primary-100 px-4 py-3 font-semibold text-primary-800 text-center">Period</div>
                      <div className="bg-primary-100 px-4 py-3 font-semibold text-primary-800 text-center">{school?.name}</div>
                      <div className="bg-primary-100 px-4 py-3 font-semibold text-primary-800 text-center">{selectedGame.opponent}</div>
                      
                      {/* Period Scores */}
                      {['1', '2', '3', '4'].map(period => (
                        <>
                          <div className="px-4 py-3 bg-gray-50 font-medium text-center border-b border-gray-200">
                            {period}
                          </div>
                          <div className="px-4 py-3 text-center border-b border-gray-200">
                            {selectedGame.score?.home?.[period] || '-'}
                          </div>
                          <div className="px-4 py-3 text-center border-b border-gray-200">
                            {selectedGame.score?.away?.[period] || '-'}
                          </div>
                        </>
                      ))}
                      
                      {/* Overtime */}
                      {selectedGame.score?.home?.OT && selectedGame.score?.away?.OT && (
                        <>
                          <div className="px-4 py-3 bg-orange-50 font-medium text-center border-b border-gray-200 text-orange-700">
                            OT
                          </div>
                          <div className="px-4 py-3 text-center border-b border-gray-200 text-orange-700">
                            {selectedGame.score.home.OT}
                          </div>
                          <div className="px-4 py-3 text-center border-b border-gray-200 text-orange-700">
                            {selectedGame.score.away.OT}
                          </div>
                        </>
                      )}
                      
                      {/* Final Score */}
                      <div className="px-4 py-3 bg-primary-50 font-bold text-center">
                        Final
                      </div>
                      <div className="px-4 py-3 bg-primary-50 font-bold text-center text-primary-700">
                        {selectedGame.score?.home?.final || '-'}
                      </div>
                      <div className="px-4 py-3 bg-primary-50 font-bold text-center text-primary-700">
                        {selectedGame.score?.away?.final || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Notes */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-primary-600 mb-4">Game Notes</h4>
                
                {/* General Notes */}
                {selectedGame.notes && (
                  <div className="mb-4">
                    <h5 className="text-lg font-medium text-primary-700 mb-2">General Notes</h5>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-800 whitespace-pre-wrap">{selectedGame.notes}</div>
                    </div>
                  </div>
                )}

                {/* Detailed Game Notes */}
                {selectedGame.gameNotes && (
                  <div className="space-y-4">
                    {/* Home Team Notes */}
                    {selectedGame.gameNotes.homeTeamNotes && (
                      <div>
                        <h5 className="text-lg font-medium text-primary-700 mb-2">{school?.name} Notes</h5>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-sm text-green-800 whitespace-pre-wrap">{selectedGame.gameNotes.homeTeamNotes}</div>
                        </div>
                      </div>
                    )}

                    {/* Away Team Notes */}
                    {selectedGame.gameNotes.awayTeamNotes && (
                      <div>
                        <h5 className="text-lg font-medium text-primary-700 mb-2">{selectedGame.opponent} Notes</h5>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="text-sm text-purple-800 whitespace-pre-wrap">{selectedGame.gameNotes.awayTeamNotes}</div>
                        </div>
                      </div>
                    )}

                    {/* Additional General Notes */}
                    {selectedGame.gameNotes.generalNotes && (
                      <div>
                        <h5 className="text-lg font-medium text-primary-700 mb-2">Additional Notes</h5>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="text-sm text-gray-800 whitespace-pre-wrap">{selectedGame.gameNotes.generalNotes}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* No Notes Available */}
                {!selectedGame.notes && !selectedGame.gameNotes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-gray-500">No game notes available for this game.</div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowGameNotesModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolPage; 