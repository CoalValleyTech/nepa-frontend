import Header from '../components/Header';

const Sports = () => (
  <div className="min-h-screen">
    <Header />
    <div className="flex">
      {/* Left grid section */}
      <aside className="w-64 bg-cream-100 p-6 flex flex-col items-start min-h-[calc(100vh-6rem)] shadow-md">
        <h2 className="text-2xl font-bold text-primary-600 mb-6">Sports</h2>
        <div className="grid gap-4 w-full">
          <button className="w-full py-3 px-4 rounded-lg bg-primary-500 text-cream-100 font-semibold text-lg hover:bg-primary-600 transition-colors">Football</button>
          <button className="w-full py-3 px-4 rounded-lg bg-primary-500 text-cream-100 font-semibold text-lg hover:bg-primary-600 transition-colors">Tennis</button>
        </div>
      </aside>
      {/* Main content area (empty for now) */}
      <main className="flex-1 flex flex-col items-center justify-center bg-cream-50 py-16">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">Sports</h1>
        <p className="text-lg text-primary-500">This is the Sports page. Content coming soon!</p>
      </main>
    </div>
  </div>
);

export default Sports; 