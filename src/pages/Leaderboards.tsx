import React, { useState, useEffect } from 'react';

interface Stats {
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

const Leaderboards = () => {
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedStat, setSelectedStat] = useState<string>('');
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisions] = useState<string[]>([]);

  const sportDivisions: { [key: string]: string[] } = {
    'football': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'basketball': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'baseball': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'softball': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'boys-soccer': ['3A', '2A', '1A'],
    'girls-soccer': ['3A', '2A', '1A'],
    'volleyball': ['3A', '2A', '1A'],
    'tennis': ['3A', '2A', '1A'],
    'boys-cross-country': ['3A', '2A', '1A'],
    'girls-cross-country': ['3A', '2A', '1A'],
    'track': ['3A', '2A', '1A'],
    'swimming': ['3A', '2A', '1A'],
    'wrestling': ['3A', '2A', '1A'],
    'field-hockey': ['3A', '2A', '1A'],
    'lacrosse': ['3A', '2A', '1A'],
    'golf-boys': ['3A', '2A', '1A'],
    'golf-girls': ['3A', '2A', '1A'],
  };

  const statOptions: { [key: string]: string[] } = {
    'football': ['passing_yards', 'rushing_yards', 'receiving_yards', 'tackles', 'interceptions', 'sacks'],
    'basketball': ['points', 'rebounds', 'assists', 'steals', 'blocks'],
    'baseball': ['batting_average', 'hits', 'runs', 'rbis', 'home_runs', 'stolen_bases'],
    'softball': ['batting_average', 'hits', 'runs', 'rbis', 'home_runs', 'stolen_bases'],
    'boys-soccer': ['goals', 'assists_soccer', 'saves', 'shutouts'],
    'girls-soccer': ['goals', 'assists_soccer', 'saves', 'shutouts'],
  };

  const statLabels: { [key: string]: string } = {
    'passing_yards': 'Passing Yards',
    'rushing_yards': 'Rushing Yards',
    'receiving_yards': 'Receiving Yards',
    'tackles': 'Tackles',
    'interceptions': 'Interceptions',
    'sacks': 'Sacks',
    'points': 'Points',
    'rebounds': 'Rebounds',
    'assists': 'Assists',
    'steals': 'Steals',
    'blocks': 'Blocks',
    'batting_average': 'Batting Average',
    'hits': 'Hits',
    'runs': 'Runs',
    'rbis': 'RBIs',
    'home_runs': 'Home Runs',
    'stolen_bases': 'Stolen Bases',
    'goals': 'Goals',
    'assists_soccer': 'Assists',
    'saves': 'Saves',
    'shutouts': 'Shutouts',
  };

  useEffect(() => {
    if (selectedSport) {
      setDivisions(sportDivisions[selectedSport] || []);
      setSelectedDivision('');
      setSelectedStat('');
      setStats([]);
    }
  }, [selectedSport]);

  useEffect(() => {
    if (selectedSport && selectedDivision && selectedStat) {
      fetchLeaderboard();
    }
  }, [selectedSport, selectedDivision, selectedStat]);

  const fetchLeaderboard = async () => {
    if (!selectedSport || !selectedDivision || !selectedStat) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/stats/leaderboard/sport/${selectedSport}/division/${selectedDivision}/stat/${selectedStat}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch leaderboard');
        setStats([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (stat: Stats, statType: string): number => {
    const value = stat[statType as keyof Stats] as number;
    return value || 0;
  };

  const formatStatValue = (value: number, statType: string): string => {
    if (statType === 'batting_average' || statType === 'earned_run_average') {
      return value.toFixed(3);
    }
    return value.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Sports Statistics Leaderboards</h1>
      
      {/* Selection Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a sport</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="baseball">Baseball</option>
              <option value="softball">Softball</option>
              <option value="boys-soccer">Boys Soccer</option>
              <option value="girls-soccer">Girls Soccer</option>
              <option value="volleyball">Volleyball</option>
              <option value="tennis">Tennis</option>
              <option value="boys-cross-country">Boys Cross Country</option>
              <option value="girls-cross-country">Girls Cross Country</option>
              <option value="track">Track & Field</option>
              <option value="swimming">Swimming</option>
              <option value="wrestling">Wrestling</option>
              <option value="field-hockey">Field Hockey</option>
              <option value="lacrosse">Lacrosse</option>
              <option value="golf-boys">Men's Golf</option>
              <option value="golf-girls">Women's Golf</option>
            </select>
          </div>
          
          {selectedSport && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Division</label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose a division</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {selectedSport && selectedDivision && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Statistic</label>
              <select
                value={selectedStat}
                onChange={(e) => setSelectedStat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose a statistic</option>
                {statOptions[selectedSport]?.map((stat) => (
                  <option key={stat} value={stat}>
                    {statLabels[stat]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Display */}
      {selectedSport && selectedDivision && selectedStat && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedSport.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {selectedDivision} Division
            </h2>
            <p className="text-primary-100 mt-1">
              Top Performers: {statLabels[selectedStat]}
            </p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          ) : stats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{statLabels[selectedStat]}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat, index) => (
                    <tr key={stat.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 'bg-primary-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.playerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.schoolName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600 text-center">
                        {formatStatValue(getStatValue(stat, selectedStat), selectedStat)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600">No statistics found for the selected criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!selectedSport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use Leaderboards</h3>
          <p className="text-blue-700">
            Select a sport, division, and statistic to view the top performers in that category. 
            The leaderboards are organized by division to provide fair comparisons between teams of similar size and competition level.
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboards 