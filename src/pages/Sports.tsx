import { useState, useEffect } from 'react';
import { getStatsForSport, TeamStats } from '../services/firebaseService';

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
      'Scranton Prep',
      'Abington Heights',
      'Honesdale',
      'North Pocono',
      'Delaware Valley',
      'Wallenpaupack',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Lackawanna Trail',
      'Riverside',
      'Lakeland',
      'Mid Valley',
      'Dunmore',
      'Western Wayne',
      'Blue Ridge',
      'Old Forge',
      'Montrose',
      'Holy Cross',
      'Mt. View',
      'West Scranton',
      'Scranton',
      'Elk Lake',
      'Forest City',
      'Carbondale',
    ],
  },
];

const boysSoccerDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights',
      'Scranton Prep',
      'North Pocono',
      'Delaware Valley',
      'Valley View',
      'Honesdale',
      'Scranton',
      'Wallenpaupack',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Dunmore',
      'Lakeland',
      'West Scranton',
      'Mt. View',
      'Western Wayne',
      'Gregory the Great',
      'Mid Valley',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'Old Forge',
      'Riverside',
      'Elk Lake',
      'Blue Ridge',
      'Holy Cross',
      'Montrose',
      'Forest City',
      'Carbondale',
    ],
  },
];

const girlsSoccerDivisions = [
  {
    name: 'Division 1',
    teams: [
      'Abington Heights',
      'Valley View',
      'Mid Valley',
      'Scranton Prep',
      'Delaware Valley',
      'North Pocono',
      'Wallenpaupack',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'Honesdale',
      'Mt. View',
      'Montrose',
      'Western Wayne',
      'Elk Lake',
      'Old Forge',
      'Lakeland',
      'Dunmore',
      'Holy Cross',
      'Forest City',
      'Carbondale',
      'Scranton',
      'West Scranton',
    ],
  },
];

const boysCrossCountryClusters = [
  {
    name: 'Cluster 1',
    teams: [
      'Abington Heights',
      'North Pocono',
      'Valley View',
    ],
  },
  {
    name: 'Cluster 2',
    teams: [
      'Susquehanna',
      'Mt. View',
      'Forest City',
    ],
  },
  {
    name: 'Cluster 3',
    teams: [
      'Montrose',
      'Blue Ridge',
      'Elk Lake',
    ],
  },
  {
    name: 'Cluster 4',
    teams: [
      'Delaware Valley',
      'Wallenpaupack',
      'Honesdale',
    ],
  },
  {
    name: 'Cluster 5',
    teams: [
      'Scranton Prep',
      'Holy Cross',
      'Carbondale',
    ],
  },
  {
    name: 'Cluster 6',
    teams: [
      'Scranton',
      'West Scranton',
      'Mid Valley',
    ],
  },
  {
    name: 'Cluster 7',
    teams: [
      'Lakeland',
      'Lack. Trail',
      'Western Wayne',
    ],
  },
  {
    name: 'Cluster 8',
    teams: [
      'Dunmore',
      'Riverside',
      'Old Forge',
    ],
  },
];

const girlsCrossCountryClusters = [
  {
    name: 'Cluster 1',
    teams: [
      'Abington Heights',
      'North Pocono',
      'Valley View',
    ],
  },
  {
    name: 'Cluster 2',
    teams: [
      'Susquehanna',
      'Mt. View',
      'Forest City',
    ],
  },
  {
    name: 'Cluster 3',
    teams: [
      'Montrose',
      'Blue Ridge',
      'Elk Lake',
    ],
  },
  {
    name: 'Cluster 4',
    teams: [
      'Delaware Valley',
      'Wallenpaupack',
      'Honesdale',
    ],
  },
  {
    name: 'Cluster 5',
    teams: [
      'Scranton Prep',
      'Holy Cross',
      'Carbondale',
    ],
  },
  {
    name: 'Cluster 6',
    teams: [
      'Scranton',
      'West Scranton',
      'Mid Valley',
    ],
  },
  {
    name: 'Cluster 7',
    teams: [
      'Lakeland',
      'Lack. Trail',
      'Western Wayne',
    ],
  },
  {
    name: 'Cluster 8',
    teams: [
      'Dunmore',
      'Riverside',
      'Old Forge',
    ],
  },
];

const volleyballTeams = [
  'North Pocono',
  'Western Wayne',
  'Mt. View',
  'Abington Heights',
  'Blue Ridge',
  'Dunmore',
  'Scranton',
  'Montrose',
  'Elk Lake',
  'Valley View',
  'Susquehanna',
  'Lakeland',
  'Lackawanna Trail',
  'Forest City',
  'West Scranton',
  'Mid Valley',
];

const Sports = () => {
  const [selectedSport, setSelectedSport] = useState<'football' | 'golf-boys' | 'golf-girls' | 'boys-soccer' | 'girls-soccer' | 'boys-cross-country' | 'girls-cross-country' | 'volleyball' | null>(null);
  const [statsData, setStatsData] = useState<{ [sport: string]: { [division: string]: TeamStats[] } }>({});
  const [statsLoading, setStatsLoading] = useState(false);

  // Load stats for the selected sport
  const loadStatsForSport = async (sport: string) => {
    if (statsData[sport]) return; // Already loaded
    
    setStatsLoading(true);
    try {
      const stats = await getStatsForSport(sport);
      setStatsData(prev => ({ ...prev, [sport]: stats }));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load stats when sport is selected
  useEffect(() => {
    if (selectedSport) {
      loadStatsForSport(selectedSport);
    }
  }, [selectedSport]);

  // Helper function to get static division structure for fallback
  const getStaticDivisions = (sport: string) => {
    switch (sport) {
      case 'football': return footballDivisions;
      case 'golf-boys': 
      case 'golf-girls': return golfDivisions;
      case 'boys-soccer': return boysSoccerDivisions;
      case 'girls-soccer': return girlsSoccerDivisions;
      case 'boys-cross-country': return boysCrossCountryClusters;
      case 'girls-cross-country': return girlsCrossCountryClusters;
      default: return [];
    }
  };

  // Render dynamic stats table with real data
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

    // Merge static division structure with dynamic stats
    const divisionsWithStats = staticDivisions.map(division => {
      const divisionKey = `division-${division.name.toLowerCase().replace(/\s+/g, '-').replace('division-', '')}`;
      const divisionStats = sportStats?.[divisionKey] || [];
      
      // Create a map of team stats for quick lookup
      const statsMap = divisionStats.reduce((acc, stat) => {
        acc[stat.teamName] = stat;
        return acc;
      }, {} as { [teamName: string]: TeamStats });

      return {
        ...division,
        statsMap
      };
    });

    return (
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-4 overflow-x-auto">
        <ul className="space-y-10">
          {divisionsWithStats.map((division: any) => (
            <li key={division.name}>
              <h3 className="text-xl font-extrabold mb-4 pb-2 border-b-4 border-orange-400 text-orange-400 uppercase tracking-wide bg-primary-500 px-2 py-2 rounded">
                {division.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-green-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-green-600">
                      <th className="px-2 sm:px-4 py-2 text-left text-white font-bold uppercase bg-primary-500">Team</th>
                      <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase bg-primary-500">Wins</th>
                      <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase bg-primary-500">Losses</th>
                      <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase bg-primary-500">Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {division.teams.map((team: string, idx: number) => {
                      const teamStats = division.statsMap[team];
                      const wins = teamStats?.wins || 0;
                      const losses = teamStats?.losses || 0;
                      const winPercent = teamStats?.winPercentage || 0;
                      
                      return (
                        <tr
                          key={team}
                          className={
                            `even:bg-orange-50 odd:bg-green-50` +
                            (idx !== division.teams.length - 1 ? ' border-b-2 border-orange-300' : '')
                          }
                        >
                          <td className="px-2 sm:px-4 py-3 font-semibold text-green-900 whitespace-nowrap">{team}</td>
                          <td className="px-2 sm:px-4 py-3 text-center text-orange-600 font-bold">{wins}</td>
                          <td className="px-2 sm:px-4 py-3 text-center text-orange-600 font-bold">{losses}</td>
                          <td className="px-2 sm:px-4 py-3 text-center text-green-700 font-bold">{winPercent.toFixed(3)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left grid section */}
        <aside className="w-full md:w-64 bg-cream-100 p-4 md:p-6 flex flex-col items-start min-h-0 md:min-h-[calc(100vh-6rem)] shadow-md">
          <h2 className="text-2xl font-bold text-primary-600 mb-4 md:mb-6">Sports</h2>
          <div className="grid gap-4 w-full">
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'football' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('football')}
            >
              Football
            </button>
            <button className="w-full py-3 px-4 rounded-lg bg-primary-500 text-cream-100 font-semibold text-lg hover:bg-primary-600 transition-colors">
              Women's Tennis
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'golf-boys' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('golf-boys')}
            >
              Men's Golf
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'golf-girls' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('golf-girls')}
            >
              Women's Golf
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'boys-soccer' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('boys-soccer')}
            >
              Men's Soccer
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'girls-soccer' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('girls-soccer')}
            >
              Women's Soccer
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'boys-cross-country' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('boys-cross-country')}
            >
              Men's Cross Country
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'girls-cross-country' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('girls-cross-country')}
            >
              Women's Cross Country
            </button>
            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                selectedSport === 'volleyball' 
                  ? 'bg-primary-600 text-cream-100' 
                  : 'bg-primary-500 text-cream-100 hover:bg-primary-600'
              }`}
              onClick={() => setSelectedSport('volleyball')}
            >
              Women's Volleyball
            </button>
          </div>
        </aside>
        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center bg-cream-50 py-8 md:py-16 px-2 sm:px-4">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">Sports</h1>
          {selectedSport ? (
            (selectedSport === 'boys-cross-country' || selectedSport === 'girls-cross-country') ? (
              <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-4 overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(selectedSport === 'boys-cross-country' ? boysCrossCountryClusters : girlsCrossCountryClusters).map((division: any) => {
                    const divisionKey = `cluster-${division.name.toLowerCase().replace(/\s+/g, '-').replace('cluster-', '')}`;
                    const divisionStats = statsData[selectedSport]?.[divisionKey] || [];
                    const statsMap = divisionStats.reduce((acc, stat) => {
                      acc[stat.teamName] = stat;
                      return acc;
                    }, {} as { [teamName: string]: TeamStats });

                    return (
                      <div key={division.name} className="bg-white rounded-lg border border-green-300 overflow-hidden">
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
                                <th className="px-2 sm:px-3 py-2 text-center text-white font-bold uppercase bg-primary-500 text-xs">Win %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {division.teams.map((team: string, idx: number) => {
                                const teamStats = statsMap[team];
                                const wins = teamStats?.wins || 0;
                                const losses = teamStats?.losses || 0;
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
            ) : selectedSport === 'volleyball' ? (
              <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-4 overflow-x-auto">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-green-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-green-600">
                        <th className="px-2 sm:px-4 py-2 text-left text-white font-bold uppercase bg-primary-500">Team</th>
                        <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase bg-primary-500">Wins</th>
                        <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase bg-primary-500">Losses</th>
                        <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase bg-primary-500">Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volleyballTeams.map((team: string, idx: number) => {
                        const teamStats = statsData[selectedSport]?.['division-1']?.find(stat => stat.teamName === team);
                        const wins = teamStats?.wins || 0;
                        const losses = teamStats?.losses || 0;
                        const winPercent = teamStats?.winPercentage || 0;
                        
                        return (
                          <tr
                            key={team}
                            className={
                              `even:bg-orange-50 odd:bg-green-50` +
                              (idx !== volleyballTeams.length - 1 ? ' border-b-2 border-orange-300' : '')
                            }
                          >
                            <td className="px-2 sm:px-4 py-3 font-semibold text-green-900 whitespace-nowrap">{team}</td>
                            <td className="px-2 sm:px-4 py-3 text-center text-orange-600 font-bold">{wins}</td>
                            <td className="px-2 sm:px-4 py-3 text-center text-orange-600 font-bold">{losses}</td>
                            <td className="px-2 sm:px-4 py-3 text-center text-green-700 font-bold">{winPercent.toFixed(3)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              renderStatsTable(selectedSport)
            )
          ) : (
            <p className="text-lg text-primary-500">This is the Sports page. Content coming soon!</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Sports; 