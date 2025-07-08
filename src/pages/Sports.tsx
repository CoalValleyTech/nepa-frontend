import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';

const divisions = [
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
  const [showDivisions, setShowDivisions] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
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
                    <h3 className="text-xl font-extrabold mb-4 pb-2 border-b-4 border-orange-400 text-orange-400 uppercase tracking-wide bg-green-600 px-2 py-2 rounded">
                      {division.name}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-green-300 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-green-600">
                            <th className="px-2 sm:px-4 py-2 text-left text-white font-bold uppercase">Team</th>
                            <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase">Wins</th>
                            <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase">Losses</th>
                            <th className="px-2 sm:px-4 py-2 text-center text-white font-bold uppercase">Win %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {division.teams.map((team, idx) => (
                            <tr
                              key={team}
                              className={
                                `even:bg-orange-50 odd:bg-green-50` +
                                (idx !== division.teams.length - 1 ? ' border-b-2 border-orange-300' : '')
                              }
                            >
                              <td className="px-2 sm:px-4 py-3 font-semibold text-green-900 whitespace-nowrap">{team}</td>
                              <td className="px-2 sm:px-4 py-3 text-center text-orange-600 font-bold">0</td>
                              <td className="px-2 sm:px-4 py-3 text-center text-orange-600 font-bold">0</td>
                              <td className="px-2 sm:px-4 py-3 text-center text-green-700 font-bold">0.000</td>
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
      <Footer />
    </div>
  );
};

export default Sports; 