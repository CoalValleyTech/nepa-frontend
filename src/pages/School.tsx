import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSchools, School as BaseSchool, deletePlayerFromRoster } from '../services/firebaseService';

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
  'cross-country-boys': '/default-running.png',
  'cross-country-girls': '/default-running.png',
  'field-hockey': '/default-field-hockey.png',
  'golf-boys': '/default-golf.png',
  'golf-girls': '/default-golf.png',
  'soccer-boys': '/default-soccer.png',
  'soccer-girls': '/default-soccer.png',
  volleyball: '/default-volleyball.png',
};

const SchoolPage = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [expandedSchedules, setExpandedSchedules] = useState<{ [sport: string]: boolean }>({});
  const [expandedRosters, setExpandedRosters] = useState<{ [sport: string]: boolean }>({});
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

  const toggleSchedule = (sport: string) => {
    setExpandedSchedules(prev => ({
      ...prev,
      [sport]: !prev[sport]
    }));
  };

  const toggleRoster = (sport: string) => {
    setExpandedRosters(prev => ({
      ...prev,
      [sport]: !prev[sport]
    }));
  };

  const deletePlayer = async (sport: string, season: string, playerIndex: number) => {
    if (!school) return;
    
    try {
      await deletePlayerFromRoster(school.id!, sport, season, playerIndex);
      // Reload the school data to reflect the change
      const updatedSchool = await getSchools();
      const currentSchool = updatedSchool.find((s: any) => s.id === school.id);
      if (currentSchool) {
        setSchool(currentSchool);
      }
    } catch (error: any) {
      console.error('Error deleting player:', error);
    }
  };

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
                          <span className="text-lg break-words leading-tight">{sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
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
                  /* Selected Sport with Collapsible Schedule */
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-primary-600 mb-4 break-words leading-tight">
                      {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
                    </h2>
                    
                    {/* Schedule Section */}
                    {school.schedules && school.schedules[selectedSport] && school.schedules[selectedSport].length > 0 ? (
                      <div className="border border-primary-200 rounded-lg overflow-hidden">
                        {/* Schedule Toggle Button */}
                        <button
                          onClick={() => toggleSchedule(selectedSport)}
                          className={`w-full text-left px-6 py-4 font-semibold text-lg transition-colors focus:outline-none
                            ${expandedSchedules[selectedSport] ? 'bg-green-50 text-green-700 border-b border-green-200' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Schedule</span>
                            <span className={`transform transition-transform ${expandedSchedules[selectedSport] ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </button>
                        
                        {/* Expanded Schedule Section */}
                        {expandedSchedules[selectedSport] && (
                          <div className="bg-green-50 p-6">
                            <ul className="space-y-3">
                              {school.schedules[selectedSport]
                                .slice()
                                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                                .map((game, idx) => {
                                  // Find opponent school (if exists)
                                  const opponentSchool = allSchools.find((s: any) => s.name === game.opponent);
                                  const opponentLogo = opponentSchool?.logoUrl || sportIcons[selectedSport] || '/default-football-helmet.png';
                                  return (
                                    <li key={idx} className="flex flex-col gap-3 bg-white p-4 rounded-lg w-full shadow-sm border border-green-100">
                                      {/* Teams Section */}
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* School Logo */}
                                        {school.logoUrl ? (
                                          <img src={school.logoUrl} alt={school.name + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-green-200 flex-shrink-0" />
                                        ) : (
                                          <img src={sportIcons[selectedSport] || '/default-football-helmet.png'} alt="Default logo" className="h-10 w-10 object-contain rounded bg-white border border-green-200 flex-shrink-0" />
                                        )}
                                        <span className="font-bold text-green-800 text-lg break-words leading-tight">{school.name}</span>
                                        <span className="text-green-700 font-semibold mx-2 flex-shrink-0">vs</span>
                                        {/* Opponent Logo */}
                                        <img src={opponentLogo} alt={game.opponent + ' logo'} className="h-10 w-10 object-contain rounded bg-white border border-green-200 flex-shrink-0" />
                                        <span className="font-bold text-green-700 text-lg break-words leading-tight">{game.opponent}</span>
                                      </div>
                                      {/* Game Details Section */}
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="text-green-600 font-medium">{game.time ? new Date(game.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                          <span className="text-green-600 font-medium">{game.time ? new Date(game.time).toLocaleDateString() : ''}</span>
                                        </div>
                                        <span className="text-green-500 font-normal break-words leading-tight">📍 {game.location}</span>
                                        
                                        {/* Score Display */}
                                        {game.score && (game.score.home?.final || game.score.away?.final) && (
                                          <div className="ml-auto flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-green-700 text-lg">
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
                                              <div className="flex gap-1 text-xs text-gray-600 mt-1">
                                                {['1', '2', '3', '4'].map(period => (
                                                  <span key={period} className="px-1">
                                                    {game.score?.home?.[period] || '-'}/{game.score?.away?.[period] || '-'}
                                                  </span>
                                                ))}
                                                {game.score?.home?.OT && game.score?.away?.OT && (
                                                  <span className="px-1 text-orange-600 font-semibold">
                                                    OT: {game.score.home.OT}/{game.score.away.OT}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-lg mb-2 text-primary-400">No games scheduled for {selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}</div>
                        <div className="text-sm text-primary-300">Check back later for upcoming games.</div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Roster Section */}
                {selectedSport && school.rosters && school.rosters[selectedSport] && (
                  <div className="border border-primary-200 rounded-lg overflow-hidden mt-4">
                    {/* Roster Toggle Button */}
                    <button
                      onClick={() => selectedSport && toggleRoster(selectedSport)}
                      className={`w-full text-left px-6 py-4 font-semibold text-lg transition-colors focus:outline-none
                        ${selectedSport && expandedRosters[selectedSport] ? 'bg-blue-50 text-blue-700 border-b border-blue-200' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Roster</span>
                        <span className={`transform transition-transform ${selectedSport && expandedRosters[selectedSport] ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>
                    
                    {/* Expanded Roster Section */}
                    {selectedSport && expandedRosters[selectedSport] && (
                      <div className="bg-blue-50 p-6">
                        {Object.entries(school.rosters[selectedSport]).map(([season, rosterData]: [string, any]) => (
                          <div key={season} className="mb-6">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">{season} Season</h4>
                            {rosterData.players && rosterData.players.length > 0 ? (
                              <div className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden">
                                <div className="grid grid-cols-5 gap-0 border-b border-blue-200 bg-blue-100">
                                  <div className="px-4 py-3 font-semibold text-blue-800 text-sm">#</div>
                                  <div className="px-4 py-3 font-semibold text-blue-800 text-sm">Name</div>
                                  <div className="px-4 py-3 font-semibold text-blue-800 text-sm">Position</div>
                                  <div className="px-4 py-3 font-semibold text-blue-800 text-sm">Grade</div>
                                  <div className="px-4 py-3 font-semibold text-blue-800 text-sm">Actions</div>
                                </div>
                                <div className="divide-y divide-blue-100">
                                  {rosterData.players.map((player: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-5 gap-0 hover:bg-blue-50">
                                      <div className="px-4 py-3 font-bold text-blue-700 text-sm">
                                        {player.number}
                                      </div>
                                      <div className="px-4 py-3 font-semibold text-blue-800 text-sm">
                                        {player.name}
                                      </div>
                                      <div className="px-4 py-3 text-blue-600 text-sm">
                                        {player.position}
                                      </div>
                                      <div className="px-4 py-3 text-blue-600 text-sm">
                                        {player.grade}
                                      </div>
                                      <div className="px-4 py-3 text-blue-600 text-sm">
                                        <button
                                          onClick={() => deletePlayer(selectedSport!, season, idx)}
                                          className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                          title="Delete Player"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-blue-600">
                                No players found for this season.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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