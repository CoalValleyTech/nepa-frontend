import Header from '../components/Header';
import { useState } from 'react';

const divisions = [
  {
    name: 'Division 1',
    teams: [
      'Delaware Valley',
      'Scranton',
      'Scranton Prep',
      'Valley View',
    ],
  },
  {
    name: 'Division 2',
    teams: [
      'North Pocono',
      'Wallenpaupack',
      'West Scranton',
      'Western Wayne',
    ],
  },
  {
    name: 'Division 3',
    teams: [
      'North Pocono',
      'Wallenpaupack',
      'West Scranton',
      'Western Wayne',
    ],
  },
];

const Sports = () => {
  const [showDivisions, setShowDivisions] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row">
        {/* Left grid section */}
        <aside className="w-full md:w-64 bg-cream-100 p-4 md:p-6 flex flex-col items-start min-h-0 md:min-h-[calc(100vh-6rem)] shadow-md">
          <h2 className="text-2xl font-bold text-primary-600 mb-4 md:mb-6">Sports</h2>
          <div className="grid gap-4 w-full">
            <button
              className="w-full py-3 px-4 rounded-lg bg-primary-500 text-cream-100 font-semibold text-lg hover:bg-primary-600 transition-colors"
              onClick={() => setShowDivisions(true)}
            >
              Football
            </button>
            <button className="w-full py-3 px-4 rounded-lg bg-primary-500 text-cream-100 font-semibold text-lg hover:bg-primary-600 transition-colors">
              Tennis
            </button>
          </div>
        </aside>
        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center bg-cream-50 py-8 md:py-16 px-2 sm:px-4">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">Sports</h1>
          {showDivisions ? (
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mt-4 overflow-x-auto">
              <ul className="space-y-10">
                {divisions.map((division) => (
                  <li key={division.name}>
                    <h3 className="text-xl font-bold text-primary-700 mb-4 border-b border-primary-200 pb-2">{division.name}</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-primary-200 text-sm">
                        <thead>
                          <tr className="bg-cream-100">
                            <th className="px-2 sm:px-4 py-2 text-left text-primary-700 font-semibold">Team</th>
                            <th className="px-2 sm:px-4 py-2 text-center text-primary-700 font-semibold">Wins</th>
                            <th className="px-2 sm:px-4 py-2 text-center text-primary-700 font-semibold">Losses</th>
                            <th className="px-2 sm:px-4 py-2 text-center text-primary-700 font-semibold">Win %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {division.teams.map((team) => (
                            <tr key={team} className="even:bg-cream-50">
                              <td className="px-2 sm:px-4 py-2 font-medium text-primary-800 whitespace-nowrap">{team}</td>
                              <td className="px-2 sm:px-4 py-2 text-center text-primary-700">0</td>
                              <td className="px-2 sm:px-4 py-2 text-center text-primary-700">0</td>
                              <td className="px-2 sm:px-4 py-2 text-center text-primary-700">0.000</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-lg text-primary-500">This is the Sports page. Content coming soon!</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Sports; 