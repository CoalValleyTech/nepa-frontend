import { useState, useEffect } from 'react';
import { getStatsForSport, TeamStats, getSchools, School } from '../services/firebaseService';

interface PlayerStats {
  id: number;
  playerName: string;
  teamName: string;
  schoolName: string;
  sport: string;
  division: string;
  season: string;
  
  // Football stats
  passingYards?: number;
  passingTouchdowns?: number;
  rushingYards?: number;
  rushingTouchdowns?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  tackles?: number;
  interceptions?: number;
  sacks?: number;
  
  // Basketball stats
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  threePointersMade?: number;
  threePointersAttempted?: number;
  freeThrowsMade?: number;
  freeThrowsAttempted?: number;
  
  // Baseball/Softball stats
  battingAverage?: number;
  hits?: number;
  runs?: number;
  rbis?: number;
  homeRuns?: number;
  stolenBases?: number;
  inningsPitched?: number;
  earnedRunAverage?: number;
  strikeouts?: number;
  wins?: number;
  losses?: number;
  
  // Soccer stats
  goals?: number;
  assistsSoccer?: number;
  saves?: number;
  shutouts?: number;
  
  // General stats
  gamesPlayed?: number;
  minutesPlayed?: number;
}

const footballDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights Comets',
      'Delaware Valley Warriors',
      'North Pocono Trojans',
      'Scranton Knights',
      'Scranton Prep Cavaliers',
      'Valley View Cougars',
      'Wallenpaupack Buckhorns',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Dunmore Bucks',
      'Honesdale Hornets',
      'Lakeland Chiefs',
      'Mid Valley Spartans',
      'West Scranton Invaders',
      'Western Wayne Wildcats',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'Carbondale Area Chargers',
      'Holy Cross Crusaders',
      'Lackawanna Trail Lions',
      'Old Forge Blue Devils',
      'Riverside Vikings',
      'Susquehanna Sabers',
    ],
  },
];

const golfDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights Comets',
      'Delaware Valley Warriors',
      'North Pocono Trojans',
      'Scranton Knights',
      'Scranton Prep Cavaliers',
      'Valley View Cougars',
      'Wallenpaupack Buckhorns',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Dunmore Bucks',
      'Honesdale Hornets',
      'Lakeland Chiefs',
      'Mid Valley Spartans',
      'West Scranton Invaders',
      'Western Wayne Wildcats',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'Carbondale Area Chargers',
      'Holy Cross Crusaders',
      'Lackawanna Trail Lions',
      'Old Forge Blue Devils',
      'Riverside Vikings',
      'Susquehanna Sabers',
    ],
  },
];

const soccerDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights Comets',
      'Delaware Valley Warriors',
      'North Pocono Trojans',
      'Scranton Knights',
      'Scranton Prep Cavaliers',
      'Valley View Cougars',
      'Wallenpaupack Buckhorns',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Dunmore Bucks',
      'Honesdale Hornets',
      'Lakeland Chiefs',
      'Mid Valley Spartans',
      'West Scranton Invaders',
      'Western Wayne Wildcats',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'Carbondale Area Chargers',
      'Holy Cross Crusaders',
      'Lackawanna Trail Lions',
      'Old Forge Blue Devils',
      'Riverside Vikings',
      'Susquehanna Sabers',
    ],
  },
];

const crossCountryDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights Comets',
      'Delaware Valley Warriors',
      'North Pocono Trojans',
      'Scranton Knights',
      'Scranton Prep Cavaliers',
      'Valley View Cougars',
      'Wallenpaupack Buckhorns',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Dunmore Bucks',
      'Honesdale Hornets',
      'Lakeland Chiefs',
      'Mid Valley Spartans',
      'West Scranton Invaders',
      'Western Wayne Wildcats',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'Carbondale Area Chargers',
      'Holy Cross Crusaders',
      'Lackawanna Trail Lions',
      'Old Forge Blue Devils',
      'Riverside Vikings',
      'Susquehanna Sabers',
    ],
  },
];

const volleyballDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights Comets',
      'Delaware Valley Warriors',
      'North Pocono Trojans',
      'Scranton Knights',
      'Scranton Prep Cavaliers',
      'Valley View Cougars',
      'Wallenpaupack Buckhorns',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Dunmore Bucks',
      'Honesdale Hornets',
      'Lakeland Chiefs',
      'Mid Valley Spartans',
      'West Scranton Invaders',
      'Western Wayne Wildcats',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'Carbondale Area Chargers',
      'Holy Cross Crusaders',
      'Lackawanna Trail Lions',
      'Old Forge Blue Devils',
      'Riverside Vikings',
      'Susquehanna Sabers',
    ],
  },
];


const Sports = () => {
  const [selectedSport, setSelectedSport] = useState<'football' | 'golf-boys' | 'golf-girls' | 'boys-soccer' | 'girls-soccer' | 'boys-cross-country' | 'girls-cross-country' | 'volleyball' | null>(null);

  // Function to get sport display name
  const getSportDisplayName = (sport: string | null) => {
    if (!sport) return 'Sports';
    
    const sportNames: { [key: string]: string } = {
      'football': 'Football',
      'golf-boys': 'Boys Golf',
      'golf-girls': 'Girls Golf',
      'boys-soccer': 'Boys Soccer',
      'girls-soccer': 'Girls Soccer',
      'boys-cross-country': 'Boys Cross Country',
      'girls-cross-country': 'Girls Cross Country',
      'volleyball': 'Volleyball'
    };
    
    return sportNames[sport] || sport;
  };

  const [statsData, setStatsData] = useState<{ [sport: string]: { [division: string]: TeamStats[] } }>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [playerStatsData, setPlayerStatsData] = useState<{ [sport: string]: { [division: string]: PlayerStats[] } }>({});
  const [schools, setSchools] = useState<School[]>([]);

  // Load stats for the selected sport
  const loadStatsForSport = async (sport: string) => {
    if (statsData[sport]) return; // Already loaded
    
    try {
      setStatsLoading(true);
      console.log('Loading stats for sport:', sport);
      const stats = await getStatsForSport(sport);
      console.log('Loaded stats data:', stats);
      setStatsData(prev => ({ ...prev, [sport]: stats }));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load player stats for the selected sport
  const loadPlayerStatsForSport = async (sport: string) => {
    if (playerStatsData[sport]) return; // Already loaded
    
    try {
      console.log('Loading player stats for sport:', sport);
      const response = await fetch(`/api/stats/sport/${sport}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded player stats data:', data);
        setPlayerStatsData(prev => ({ ...prev, [sport]: data }));
      }
    } catch (error) {
      console.error('Error loading player stats:', error);
    }
  };

  // Load schools data
  const loadSchools = async () => {
    try {
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      loadStatsForSport(selectedSport);
      loadPlayerStatsForSport(selectedSport);
    }
  }, [selectedSport]);

  // Helper function to get static division structure for fallback
  const getStaticDivisions = (sport: string) => {
    switch (sport) {
      case 'football': return footballDivisions;
      case 'golf-boys': 
      case 'golf-girls': return golfDivisions;
      case 'boys-soccer': return soccerDivisions;
      case 'girls-soccer': return soccerDivisions;
      case 'boys-cross-country': return crossCountryDivisions;
      case 'girls-cross-country': return crossCountryDivisions;
      case 'volleyball': return volleyballDivisions;
      default: return [];
    }
  };

  const renderStatsTable = (sport: string) => {
    const sportStats = statsData[sport];
    const staticDivisions = getStaticDivisions(sport);
    
    if (statsLoading) {
      return (
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-primary-600">Loading team statistics...</p>
          </div>
        </div>
      );
    }

    // Merge static division structure with dynamic stats and sort teams by performance
    const divisionsWithStats = staticDivisions.map(division => {
      const divisionKey = `division-${division.name.toLowerCase().replace(/\s+/g, '-').replace('division-', '')}`;
      const divisionStats = sportStats?.[divisionKey] || [];
      
      // Create a map of team stats for quick lookup
      const statsMap = divisionStats.reduce((acc, stat) => {
        acc[stat.teamName] = stat;
        return acc;
      }, {} as { [teamName: string]: TeamStats });

      // Sort teams by performance: win percentage descending, then wins descending
      const sortedTeams = [...division.teams].sort((teamA, teamB) => {
        const statsA = statsMap[teamA];
        const statsB = statsMap[teamB];
        
        const winPercentA = statsA?.winPercentage || 0;
        const winPercentB = statsB?.winPercentage || 0;
        const winsA = statsA?.wins || 0;
        const winsB = statsB?.wins || 0;
        
        // First sort by win percentage (higher is better)
        if (winPercentB !== winPercentA) {
          return winPercentB - winPercentA;
        }
        
        // If win percentages are equal, sort by total wins (higher is better)
        return winsB - winsA;
      });

      return {
        ...division,
        teams: sortedTeams,
        statsMap
      };
    });

    // For all sports, use 2-column grid layout with centered last division if odd number
    return (
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-4 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {divisionsWithStats.map((division: any, index: number) => {
            // If this is the last division and there's an odd number, center it
            const isLastDivision = index === divisionsWithStats.length - 1;
            const isOddNumberOfDivisions = divisionsWithStats.length % 2 === 1;
            const shouldCenter = isLastDivision && isOddNumberOfDivisions;
            
            return (
              <div 
                key={division.name} 
                className={`bg-white rounded-lg border border-green-300 overflow-hidden ${
                  shouldCenter ? 'md:col-span-2 md:mx-auto md:w-1/2' : ''
                }`}
              >
                <h3 className="text-lg font-extrabold mb-3 pb-2 border-b-2 border-orange-400 text-orange-400 uppercase tracking-wide bg-primary-500 px-3 py-2">
                  {division.name}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-green-600">
                        <th className="px-2 sm:px-3 py-2 text-left text-white font-bold uppercase bg-primary-500 text-xs">Team</th>
                        <th className="px-2 sm:px-3 py-2 text-center text-white font-bold uppercase bg-primary-500 text-xs">Wins</th>
                        <th className="px-2 sm:px-3 py-2 text-center text-white font-bold uppercase bg-primary-500 text-xs">Losses</th>
                        <th className="px-2 sm:px-3 py-2 text-center text-white font-bold uppercase bg-primary-500 text-xs">Overall</th>
                        <th className="px-2 sm:px-3 py-2 text-center text-white font-bold uppercase bg-primary-500 text-xs">Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {division.teams.map((team: string, idx: number) => {
                        const teamStats = division.statsMap[team];
                        const wins = teamStats?.wins || 0;
                        const losses = teamStats?.losses || 0;
                        const overall = teamStats?.overall || `${wins}-${losses}`;
                        const winPercent = teamStats?.winPercentage || 0;
                        
                        return (
                          <tr
                            key={team}
                            className={
                              `even:bg-orange-50 odd:bg-green-50` +
                              (idx !== division.teams.length - 1 ? ' border-b border-orange-200' : '')
                            }
                          >
                            <td className="px-2 sm:px-3 py-2 font-semibold text-green-900 whitespace-nowrap text-xs">{team}</td>
                            <td className="px-2 sm:px-3 py-2 text-center text-orange-600 font-bold text-xs">{wins}</td>
                            <td className="px-2 sm:px-3 py-2 text-center text-orange-600 font-bold text-xs">{losses}</td>
                            <td className="px-2 sm:px-3 py-2 text-center text-orange-600 font-bold text-xs">{overall}</td>
                            <td className="px-2 sm:px-3 py-2 text-center text-green-700 font-bold text-xs">{winPercent.toFixed(3)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left grid section */}
        <aside className="w-full md:w-64 bg-white border-r-2 border-primary-200 p-6 flex flex-col min-h-0 md:min-h-[calc(100vh-6rem)]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary-700 mb-2">Sports</h2>
            <div className="h-0.5 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
          </div>
          
          <div className="space-y-1 w-full">
            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'football' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('football')}
            >
              <div className="flex items-center justify-between">
                <span>Football</span>
                {selectedSport === 'football' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'golf-boys' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('golf-boys')}
            >
              <div className="flex items-center justify-between">
                <span>Boys Golf</span>
                {selectedSport === 'golf-boys' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'golf-girls' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('golf-girls')}
            >
              <div className="flex items-center justify-between">
                <span>Girls Golf</span>
                {selectedSport === 'golf-girls' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'boys-soccer' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('boys-soccer')}
            >
              <div className="flex items-center justify-between">
                <span>Boys Soccer</span>
                {selectedSport === 'boys-soccer' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'girls-soccer' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('girls-soccer')}
            >
              <div className="flex items-center justify-between">
                <span>Girls Soccer</span>
                {selectedSport === 'girls-soccer' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'boys-cross-country' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('boys-cross-country')}
            >
              <div className="flex items-center justify-between">
                <span>Boys Cross Country</span>
                {selectedSport === 'boys-cross-country' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'girls-cross-country' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('girls-cross-country')}
            >
              <div className="flex items-center justify-between">
                <span>Girls Cross Country</span>
                {selectedSport === 'girls-cross-country' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            <button
              className={`w-full py-4 px-5 rounded-xl font-semibold text-base transition-all duration-200 ${
                selectedSport === 'volleyball' 
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-primary-700 hover:bg-primary-50 hover:text-primary-800 border border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => setSelectedSport('volleyball')}
            >
              <div className="flex items-center justify-between">
                <span>Volleyball</span>
                {selectedSport === 'volleyball' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center bg-cream-50 py-8 md:py-16 px-2 sm:px-4">
          <h1 className="text-3xl font-bold text-primary-600 mb-8">{getSportDisplayName(selectedSport)} - Division Standings and League Leaders</h1>
          
          {selectedSport ? (
            <div className="w-full max-w-6xl space-y-8">
              {/* Division Leaderboards Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary-700">
                  Division Leaderboards
                </h2>
                {renderStatsTable(selectedSport)}
              </div>

              {/* LIAA Power Rankings Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-primary-700 mb-6">
                  LIAA Power Rankings
                </h2>
                <div className="space-y-4">
                  {[
                    { rank: 1, team: 'Abington Heights Comets', record: '8-1', division: 'Division 1' },
                    { rank: 2, team: 'Scranton Prep Cavaliers', record: '7-2', division: 'Division 1' },
                    { rank: 3, team: 'Valley View Cougars', record: '6-3', division: 'Division 1' },
                    { rank: 4, team: 'North Pocono Trojans', record: '5-4', division: 'Division 1' },
                    { rank: 5, team: 'Delaware Valley Warriors', record: '4-5', division: 'Division 1' }
                  ].map((team) => {
                    const school = schools.find(s => team.team.includes(s.name));
                    return (
                      <div key={team.rank} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {team.rank}
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {school?.logoUrl ? (
                            <img src={school.logoUrl} alt={`${team.team} logo`} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs text-gray-500">LOGO</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{team.team}</div>
                          <div className="text-sm text-gray-600">{team.division}</div>
                        </div>
                        <div className="text-lg font-bold text-primary-600">{team.record}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIAA Leaders Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-primary-700 mb-6">
                  LIAA Leaders
                </h2>
                <div className="text-center py-12">
                  <p className="text-xl font-semibold text-gray-500">Coming Soon!</p>
                </div>
              </div>

              {/* Division Statistics Sections */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-primary-700 mb-6">
                  Division Statistics
                </h2>
                <div className="text-center py-12">
                  <p className="text-xl font-semibold text-gray-500">Coming Soon!</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-primary-500 mb-4">Select a sport to view statistics</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Sports Statistics</h3>
                <p className="text-blue-700 text-sm">
                  Choose a sport from the sidebar to view team rankings, individual player statistics, and division standings.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Sports;