import React from 'react';

const ScheduleStatic: React.FC = () => {
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
        <section className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Schedule</h2>
          <div className="text-gray-400 italic">Coming Soon</div>
        </section>
      </main>
    </div>
  );
};

export default ScheduleStatic; 