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
      <div className="flex">
        {/* Left grid section */}
        <aside className="w-64 bg-cream-100 p-6 flex flex-col items-start min-h-[calc(100vh-6rem)] shadow-md">
          <h2 className="text-2xl font-bold text-primary-600 mb-6">Sports</h2>
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
        <main className="flex-1 flex flex-col items-center justify-center bg-cream-50 py-16">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">Sports</h1>
          {showDivisions ? (
            <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mt-4">
              <ul className="space-y-6">
                {divisions.map((division) => (
                  <li key={division.name} className="">
                    <h3 className="text-lg font-bold text-primary-700 mb-2">{division.name}</h3>
                    <ul className="space-y-1 ml-4">
                      {division.teams.map((team) => (
                        <li key={team} className="px-3 py-1 rounded bg-cream-100 text-primary-700 font-medium shadow-sm">
                          {team}
                        </li>
                      ))}
                    </ul>
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