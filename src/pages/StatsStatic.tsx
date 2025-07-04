import React from 'react';

const StatsStatic: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">NEPA High School Football</h1>
        <nav>
          <ul className="flex space-x-6">
            <li className="hover:underline cursor-pointer">Home</li>
            <li className="hover:underline cursor-pointer">Schools <span className="text-xs text-gray-500">(Coming Soon)</span></li>
            <li className="hover:underline cursor-pointer">Stats</li>
            <li className="hover:underline cursor-pointer">Schedule</li>
          </ul>
        </nav>
      </header>
      <main className="p-6">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Standings</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">School</th>
                <th className="border-b p-2">W</th>
                <th className="border-b p-2">L</th>
                <th className="border-b p-2">T</th>
              </tr>
            </thead>
            <tbody>
              {/* No teams yet, new season */}
            </tbody>
          </table>
          <div className="text-gray-400 italic mt-4">Standings will appear here as the season progresses.</div>
        </section>
      </main>
    </div>
  );
};

export default StatsStatic; 