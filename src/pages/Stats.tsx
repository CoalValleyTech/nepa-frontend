import { useState } from 'react';

const Stats = () => {
  const [selectedDivision, setSelectedDivision] = useState('LIAA');

  const divisions = [
    { id: 'LIAA', name: 'LIAA' },
    { id: 'DIV1', name: 'Division 1' },
    { id: 'DIV2', name: 'Division 2' },
    { id: 'DIV3', name: 'Division 3' }
  ];

  const divisionTeams = {
    LIAA: [
      'All Teams'
    ],
    DIV1: [
      'Scranton Prep',
      'Valley View', 
      'Delaware Valley',
      'Abington Heights',
      'North Pocono',
      'Scranton',
      'Wallenpaupack'
    ],
    DIV2: [
      'Western Wayne',
      'Mid Valley',
      'Honesdale',
      'Dunmore',
      'Lakeland',
      'West Scranton'
    ],
    DIV3: [
      'Lackawanna Trail',
      'Riverside',
      'Carbondale',
      'Susquehanna',
      'Old Forge',
      'Holy Cross'
    ]
  };

  // Sample standings data
  const standings = {
    DIV1: [
      { rank: 1, team: 'Scranton Prep', wins: 8, losses: 0, winPct: '1.000' },
      { rank: 2, team: 'Valley View', wins: 7, losses: 1, winPct: '.875' },
      { rank: 3, team: 'Delaware Valley', wins: 6, losses: 2, winPct: '.750' },
      { rank: 4, team: 'Abington Heights', wins: 5, losses: 3, winPct: '.625' },
      { rank: 5, team: 'North Pocono', wins: 4, losses: 4, winPct: '.500' },
      { rank: 6, team: 'Scranton', wins: 3, losses: 5, winPct: '.375' },
      { rank: 7, team: 'Wallenpaupack', wins: 2, losses: 6, winPct: '.250' }
    ],
    DIV2: [
      { rank: 1, team: 'Dunmore', wins: 8, losses: 0, winPct: '1.000' },
      { rank: 2, team: 'Lakeland', wins: 7, losses: 1, winPct: '.875' },
      { rank: 3, team: 'Western Wayne', wins: 6, losses: 2, winPct: '.750' },
      { rank: 4, team: 'Mid Valley', wins: 5, losses: 3, winPct: '.625' },
      { rank: 5, team: 'Honesdale', wins: 4, losses: 4, winPct: '.500' },
      { rank: 6, team: 'West Scranton', wins: 3, losses: 5, winPct: '.375' }
    ],
    DIV3: [
      { rank: 1, team: 'Lackawanna Trail', wins: 8, losses: 0, winPct: '1.000' },
      { rank: 2, team: 'Old Forge', wins: 7, losses: 1, winPct: '.875' },
      { rank: 3, team: 'Holy Cross', wins: 6, losses: 2, winPct: '.750' },
      { rank: 4, team: 'Riverside', wins: 5, losses: 3, winPct: '.625' },
      { rank: 5, team: 'Carbondale', wins: 4, losses: 4, winPct: '.500' },
      { rank: 6, team: 'Susquehanna', wins: 3, losses: 5, winPct: '.375' }
    ]
  };

  const renderContent = () => {
    if (selectedDivision === 'LIAA') {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primary-500 mb-6">All Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...divisionTeams.DIV1, ...divisionTeams.DIV2, ...divisionTeams.DIV3].map((team, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">LOGO</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{team}</h3>
                  <p className="text-sm text-gray-500">Team</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Teams Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primary-500 mb-6">Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {divisionTeams[selectedDivision as keyof typeof divisionTeams].map((team, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">LOGO</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{team}</h3>
                  <p className="text-sm text-gray-500">{divisions.find(d => d.id === selectedDivision)?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-primary-500 mb-6">Standings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Team</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">W</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">L</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Pct</th>
                </tr>
              </thead>
              <tbody>
                {standings[selectedDivision as keyof typeof standings]?.map((team, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{team.rank}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-medium">L</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{team.team}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-center text-gray-700">{team.wins}</td>
                    <td className="py-4 px-4 text-sm text-center text-gray-700">{team.losses}</td>
                    <td className="py-4 px-4 text-sm text-center text-gray-700">{team.winPct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen pt-16">
      {/* Grid Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-primary-500 mb-4">Divisions</h2>
          <div className="space-y-0">
            {divisions.map((division, index) => (
              <div key={division.id}>
                <button
                  onClick={() => setSelectedDivision(division.id)}
                  className={`w-full p-4 text-left text-sm font-medium transition-all duration-200 ${
                    selectedDivision === division.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-primary-500'
                  }`}
                >
                  {division.name}
                </button>
                {index < divisions.length - 1 && (
                  <div className="w-full h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-primary-500 mb-6">
            {divisions.find(d => d.id === selectedDivision)?.name} Statistics
          </h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Stats; 