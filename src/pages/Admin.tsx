import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { School, getSchools } from '../services/firebaseService';
import AdminAddSchool from './AdminAddSchool';
import AdminAddSport from './AdminAddSport';
import AdminAddSchedule from './AdminAddSchedule';

const allowedAdmins = ['batesnate958@gmail.com', 'mnovak03@outlook.com'];

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [activeTab, setActiveTab] = useState<'addSchool' | 'addSport' | 'addSchedule'>('addSchool');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
      } else if (!allowedAdmins.includes(user.email || '')) {
        navigate('/login');
      } else {
        setLoading(false);
        loadSchools();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadSchools = async () => {
    try {
      setSchoolsLoading(true);
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (error) {
      // Optionally handle error
    } finally {
      setSchoolsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-primary-100 shadow-md flex-shrink-0 flex flex-row md:flex-col items-center md:items-stretch py-4 md:py-12 px-2 md:px-4">
        <nav className="w-full space-x-2 md:space-x-0 md:space-y-4 flex flex-row md:flex-col justify-center md:justify-start">
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addSchool' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addSchool')}
          >
            Add School
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addSport' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addSport')}
          >
            Add Sport
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addSchedule' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addSchedule')}
          >
            Add Schedule
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <h1 className="text-3xl font-bold text-primary-700 mb-8">Admin Dashboard</h1>
        <div className="w-full flex flex-col items-center">
          {activeTab === 'addSchool' && (
            <AdminAddSchool
              schools={schools}
              setSchools={setSchools}
              schoolsLoading={schoolsLoading}
              setSchoolsLoading={setSchoolsLoading}
            />
          )}
          {activeTab === 'addSport' && (
            <AdminAddSport schools={schools} />
          )}
          {activeTab === 'addSchedule' && (
            <AdminAddSchedule schools={schools} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin; 