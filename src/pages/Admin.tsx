import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import AdminAddSchool from './AdminAddSchool';
import AdminAddSport from './AdminAddSport';
import AdminAddSchedule from './AdminAddSchedule';
import AdminAddGame from './AdminAddGame';
import AdminAddRoster from './AdminAddRoster';
import { getSchools, getArticles, addArticle, deleteArticle, School, Article, updateTeamStats, getTeamStats, TeamStats, getScheduleForSchool, updateScheduleWithScores } from '../services/firebaseService';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'addSchool' | 'addSport' | 'addSchedule' | 'addGame' | 'editSchedule' | 'addArticle' | 'addRoster' | 'addStats'>('addSchool');
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [expandedSport, setExpandedSport] = useState<{ [key: string]: string }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [scoreInputs, setScoreInputs] = useState<any>({ home: {}, away: {} });
  
  // Schedule management states
  const [schoolSchedules, setSchoolSchedules] = useState<{ [schoolId: string]: { [sport: string]: any[] } }>({});
  const [editingGameIndex, setEditingGameIndex] = useState<number | null>(null);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editingSport, setEditingSport] = useState<string>('');
  const [gameNotes, setGameNotes] = useState<string>('');

  // Add Stats states
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [teamStatsInputs, setTeamStatsInputs] = useState<{ [teamName: string]: { wins: number; losses: number } }>({});
  const [statsLoading, setStatsLoading] = useState(false);

  // Article form state
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    imageUrl: ''
  });

  const sportDivisions = {
    'football': ['division-1', 'division-2', 'division-3'],
    'golf-boys': ['division-1', 'division-2'],
    'golf-girls': ['division-1', 'division-2'],
    'boys-soccer': ['division-1', 'division-2', 'division-3'],
    'girls-soccer': ['division-1', 'division-2'],
    'boys-cross-country': ['cluster-1', 'cluster-2', 'cluster-3', 'cluster-4', 'cluster-5', 'cluster-6', 'cluster-7', 'cluster-8'],
    'girls-cross-country': ['cluster-1', 'cluster-2', 'cluster-3', 'cluster-4', 'cluster-5', 'cluster-6', 'cluster-7', 'cluster-8'],
    'volleyball': ['division-1'],
    'tennis': ['division-1']
  };

  const teamData = {
    'football': {
      'division-1': ['Abington Heights Comets', 'Delaware Valley Warriors', 'North Pocono Trojans', 'Scranton Knights', 'Scranton Prep Cavaliers', 'Valley View Cougars', 'Wallenpaupack Buckhorns'],
      'division-2': ['Dunmore Bucks', 'Honesdale Hornets', 'Lakeland Chiefs', 'Mid Valley Spartans', 'West Scranton Invaders', 'Western Wayne Wildcats'],
      'division-3': ['Carbondale Area Chargers', 'Holy Cross Crusaders', 'Lackawanna Trail Lions', 'Old Forge Blue Devils', 'Riverside Vikings', 'Susquehanna Sabers']
    },
    'golf-boys': {
      'division-1': ['Scranton Prep', 'Abington Heights', 'Honesdale', 'North Pocono', 'Delaware Valley', 'Wallenpaupack'],
      'division-2': ['Lackawanna Trail', 'Riverside', 'Lakeland', 'Mid Valley', 'Dunmore', 'Western Wayne', 'Blue Ridge', 'Old Forge', 'Montrose', 'Holy Cross', 'Mt. View', 'West Scranton', 'Scranton', 'Elk Lake', 'Forest City', 'Carbondale']
    },
    'golf-girls': {
      'division-1': ['Scranton Prep', 'Abington Heights', 'Honesdale', 'North Pocono', 'Delaware Valley', 'Wallenpaupack'],
      'division-2': ['Lackawanna Trail', 'Riverside', 'Lakeland', 'Mid Valley', 'Dunmore', 'Western Wayne', 'Blue Ridge', 'Old Forge', 'Montrose', 'Holy Cross', 'Mt. View', 'West Scranton', 'Scranton', 'Elk Lake', 'Forest City', 'Carbondale']
    },
    'boys-soccer': {
      'division-1': ['Abington Heights', 'Scranton Prep', 'North Pocono', 'Delaware Valley', 'Valley View', 'Honesdale', 'Scranton', 'Wallenpaupack'],
      'division-2': ['Dunmore', 'Lakeland', 'West Scranton', 'Mt. View', 'Western Wayne', 'Gregory the Great', 'Mid Valley'],
      'division-3': ['Old Forge', 'Riverside', 'Elk Lake', 'Blue Ridge', 'Holy Cross', 'Montrose', 'Forest City', 'Carbondale']
    },
    'girls-soccer': {
      'division-1': ['Abington Heights', 'Valley View', 'Mid Valley', 'Scranton Prep', 'Delaware Valley', 'North Pocono', 'Wallenpaupack'],
      'division-2': ['Honesdale', 'Mt. View', 'Montrose', 'Western Wayne', 'Elk Lake', 'Old Forge', 'Lakeland', 'Dunmore', 'Holy Cross', 'Forest City', 'Carbondale', 'Scranton', 'West Scranton']
    },
    'boys-cross-country': {
      'cluster-1': ['Abington Heights', 'North Pocono', 'Valley View'],
      'cluster-2': ['Susquehanna', 'Mt. View', 'Forest City'],
      'cluster-3': ['Montrose', 'Blue Ridge', 'Elk Lake'],
      'cluster-4': ['Delaware Valley', 'Wallenpaupack', 'Honesdale'],
      'cluster-5': ['Scranton Prep', 'Holy Cross', 'Carbondale'],
      'cluster-6': ['Scranton', 'West Scranton', 'Mid Valley'],
      'cluster-7': ['Lakeland', 'Lack. Trail', 'Western Wayne'],
      'cluster-8': ['Dunmore', 'Riverside', 'Old Forge']
    },
    'girls-cross-country': {
      'cluster-1': ['Abington Heights', 'North Pocono', 'Valley View'],
      'cluster-2': ['Susquehanna', 'Mt. View', 'Forest City'],
      'cluster-3': ['Montrose', 'Blue Ridge', 'Elk Lake'],
      'cluster-4': ['Delaware Valley', 'Wallenpaupack', 'Honesdale'],
      'cluster-5': ['Scranton Prep', 'Holy Cross', 'Carbondale'],
      'cluster-6': ['Scranton', 'West Scranton', 'Mid Valley'],
      'cluster-7': ['Lakeland', 'Lack. Trail', 'Western Wayne'],
      'cluster-8': ['Dunmore', 'Riverside', 'Old Forge']
    },
    'volleyball': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton', 'Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside']
    },
    'tennis': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton', 'Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside']
    }
  };

  // Authentication effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // User is not authenticated, redirect to login
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load schools effect
  useEffect(() => {
    if (user) {
      loadSchools();
    }
  }, [user]);

  // Load articles effect
  useEffect(() => {
    if (user) {
      loadArticles();
    }
  }, [user]);

  // Load current stats effect
  useEffect(() => {
    if (user && selectedSport && selectedDivision) {
      loadCurrentStats();
    }
  }, [user, selectedSport, selectedDivision]);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show a message (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
          <p className="text-sm text-gray-500 mt-2">You need to be logged in to access the admin panel</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleArticleChange = (field: string, value: string) => setArticleForm((prev: any) => ({ ...prev, [field]: value }));
  
  const handleArticleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setArticleForm((prev: any) => ({ ...prev, imageUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddArticle = async () => {
    if (!articleForm.title || !articleForm.content || !articleForm.excerpt || !articleForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newArticle = {
        ...articleForm,
        date: new Date().toLocaleDateString()
      };
      await addArticle(newArticle);
      setArticleForm({ title: '', content: '', excerpt: '', category: '', imageUrl: '' });
      loadArticles();
    } catch (error) {
      console.error('Error adding article:', error);
      alert('Error adding article');
    }
  };

  const handleDeleteArticle = async (idx: number) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const article = articles[idx];
        if (article.id) {
          await deleteArticle(article.id);
          loadArticles();
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article');
      }
    }
  };

  const handleArchiveArticle = (idx: number) => {
    const updatedArticles = [...articles];
    (updatedArticles[idx] as any).archived = true;
    setArticles(updatedArticles);
  };

  const handleDeleteArchivedArticle = (idx: number) => {
    const archivedArticles = articles.filter((article: any) => article.archived);
    const article = archivedArticles[idx];
    if (window.confirm('Are you sure you want to permanently delete this archived article?')) {
      const updatedArticles = articles.filter(a => a.id !== article.id);
      setArticles(updatedArticles);
    }
  };

  const loadSchools = async () => {
    try {
      setSchoolsLoading(true);
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setSchoolsLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const articlesData = await getArticles();
      setArticles(articlesData);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  // Load current stats for selected sport and division
  const loadCurrentStats = async () => {
    if (!selectedSport || !selectedDivision) return;
    
    setStatsLoading(true);
    try {
      const teams = (teamData as any)[selectedSport]?.[selectedDivision] || [];
      const statsPromises = teams.map((teamName: string) => 
        getTeamStats(teamName, selectedSport, selectedDivision)
      );
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap: { [teamName: string]: TeamStats } = {};
      const inputsMap: { [teamName: string]: { wins: number; losses: number } } = {};
      
      teams.forEach((teamName: string, index: number) => {
        const stats = statsResults[index];
        if (stats) {
          statsMap[teamName] = stats;
          // Ensure wins and losses are always numbers, defaulting to 0 if undefined/null
          inputsMap[teamName] = { 
            wins: Number(stats.wins) || 0, 
            losses: Number(stats.losses) || 0 
          };
        } else {
          inputsMap[teamName] = { wins: 0, losses: 0 };
        }
      });
      
      setTeamStatsInputs(inputsMap);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Update team stats input
  const handleStatsInputChange = (teamName: string, field: 'wins' | 'losses', value: string) => {
    // Ensure we always have a valid number, defaulting to 0 for empty/invalid values
    const numValue = value === '' ? 0 : (parseInt(value) || 0);
    
    setTeamStatsInputs(prev => ({
      ...prev,
      [teamName]: {
        ...prev[teamName],
        [field]: numValue
      }
    }));
  };

  // Update team stats in Firebase
  const handleUpdateTeamStats = async (teamName: string) => {
    if (!selectedSport || !selectedDivision) {
      alert('Please select both a sport and division first');
      return;
    }
    
    try {
      const inputs = teamStatsInputs[teamName];
      if (!inputs) {
        // If inputs don't exist, create default values
        setTeamStatsInputs(prev => ({
          ...prev,
          [teamName]: { wins: 0, losses: 0 }
        }));
        return;
      }
      
      // Ensure wins and losses are always valid numbers
      const wins = Number(inputs.wins) || 0;
      const losses = Number(inputs.losses) || 0;
      
      const teamStats: TeamStats = {
        teamName,
        sport: selectedSport,
        division: selectedDivision,
        wins: wins,
        losses: losses,
        winPercentage: 0, // Will be calculated in the service
        season: '2024-25'
      };
      
      console.log('=== SAVING TEAM STATS ===');
      console.log('Selected Sport:', selectedSport);
      console.log('Selected Division:', selectedDivision);
      console.log('Team Name:', teamName);
      console.log('Team Stats Object:', teamStats);
      console.log('Document ID will be:', `${selectedSport}-${selectedDivision}-${teamName.replace(/\s+/g, '-').toLowerCase()}-2024-25`);
      
      console.log('Calling updateTeamStats...');
      await updateTeamStats(teamStats);
      console.log('updateTeamStats completed successfully');
      
      console.log('Reloading stats...');
      // Reload stats to get updated data
      await loadCurrentStats();
      console.log('Stats reloaded successfully');
      
      alert(`Stats updated successfully for ${teamName}!`);
    } catch (error: any) {
      console.error('Error in handleUpdateTeamStats:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      alert(`Error updating stats: ${error.message}`);
    }
  };





  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingGame(null);
    setScoreInputs({ home: {}, away: {} });
    setGameNotes('');
  };

  // Load schedules for a school and sport
  const loadSchoolSchedules = async (schoolId: string, sport: string) => {
    try {
      const schedules = await getScheduleForSchool(schoolId, sport);
      setSchoolSchedules(prev => ({
        ...prev,
        [schoolId]: {
          ...prev[schoolId],
          [sport]: schedules
        }
      }));
    } catch (error) {
      console.error('Error loading schedules:', error);
      // Set empty array if no schedules found
      setSchoolSchedules(prev => ({
        ...prev,
        [schoolId]: {
          ...prev[schoolId],
          [sport]: []
        }
      }));
    }
  };

  // Handle sport selection to load schedules
  const handleSportSelection = async (schoolId: string, sport: string) => {
    const newSelectedSport = expandedSport[schoolId] === sport ? '' : sport;
    setExpandedSport(prev => ({
      ...prev,
      [schoolId]: newSelectedSport
    }));
    
    if (newSelectedSport) {
      await loadSchoolSchedules(schoolId, newSelectedSport);
    }
  };

  // Start editing a game's scores
  const handleStartScoreEdit = (schoolId: string, sport: string, gameIndex: number, game: any) => {
    setEditingSchoolId(schoolId);
    setEditingSport(sport);
    setEditingGameIndex(gameIndex);
    setEditingGame(game);
    
    // Initialize score inputs with existing scores or empty values
    const homeScore = game.score?.home?.final || '';
    const awayScore = game.score?.away?.final || '';
    setScoreInputs({
      home: { final: homeScore },
      away: { final: awayScore }
    });
    
    // Initialize notes with existing notes or empty string
    setGameNotes(game.notes || '');
    
    setShowEditModal(true);
  };

  // Save score updates
  const handleSaveScores = async () => {
    if (!editingSchoolId || !editingSport || editingGameIndex === null || !editingGame) return;
    
    try {
      const updatedGame = {
        ...editingGame,
        score: scoreInputs,
        notes: gameNotes,
        status: scoreInputs.home.final && scoreInputs.away.final ? 'FINAL' : 'UPCOMING'
      };
      
      await updateScheduleWithScores(editingSchoolId, editingSport, editingGameIndex, updatedGame);
      
      // Update local state
      setSchoolSchedules(prev => ({
        ...prev,
        [editingSchoolId]: {
          ...prev[editingSchoolId],
          [editingSport]: prev[editingSchoolId][editingSport].map((game: any, index: number) => 
            index === editingGameIndex ? updatedGame : game
          )
        }
      }));
      
      // Close modal and reset state
      setShowEditModal(false);
      setEditingGame(null);
      setEditingGameIndex(null);
      setEditingSchoolId(null);
      setEditingSport('');
      setScoreInputs({ home: {}, away: {} });
      setGameNotes('');
      
      alert('Scores and notes updated successfully!');
    } catch (error) {
      console.error('Error saving scores:', error);
      alert('Error saving scores');
    }
  };







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
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addGame' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addGame')}
          >
            Add Game
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'editSchedule' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('editSchedule')}
          >
            Edit Schedule
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addArticle' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addArticle')}
          >
            Add Article
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addRoster' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addRoster')}
          >
            Add Roster
          </button>
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'addStats' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('addStats')}
          >
            Add Stats
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left bg-red-600 text-white hover:bg-red-700 mt-8"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        {/* Header with Logout */}
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
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
            <AdminAddSchedule schools={schools} reloadSchools={loadSchools} />
          )}
          {activeTab === 'addGame' && (
            <AdminAddGame schools={schools} />
          )}
          {activeTab === 'editSchedule' && (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Edit Schedule & Scores</h2>
              <div className="text-primary-500 mb-6">Select a school to view and edit its sports schedules and scores</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {schools.map(school => {
                  const schoolId = school.id || '';
                  const selectedSport = expandedSport[schoolId] || '';
                  const schoolScheduleData = schoolSchedules[schoolId] || {};
                  const sportSchedules = schoolScheduleData[selectedSport] || [];
                  
                  return (
                    <div
                      key={schoolId}
                      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 transition-all ${expandedSchoolId === schoolId ? 'border-primary-500' : 'border-transparent'}`}
                      onClick={() => setExpandedSchoolId(expandedSchoolId === schoolId ? null : schoolId)}
                    >
                      <div className="flex items-center gap-4">
                        {school.logoUrl && <img src={school.logoUrl} alt={school.name + ' logo'} className="h-12 w-12 object-contain rounded bg-white border border-primary-200" />}
                        <div className="text-xl font-bold text-primary-700">{school.name}</div>
                      </div>
                      {expandedSchoolId === schoolId && (
                        <div className="mt-4">
                          <div className="font-semibold text-primary-600 mb-2">Sports:</div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(school.sports || []).map(sport => (
                              <button
                                key={sport}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  selectedSport === sport
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSportSelection(schoolId, sport);
                                }}
                              >
                                {sport}
                              </button>
                            ))}
                          </div>
                          {selectedSport && (
                            <div className="mt-4">
                              <div className="font-semibold text-primary-700 mb-2">
                                Games for {selectedSport} ({sportSchedules.length})
                              </div>
                              {sportSchedules.length === 0 ? (
                                <div className="text-gray-500 text-sm text-center py-4">
                                  No games scheduled for {selectedSport}
                                </div>
                              ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {sportSchedules.map((game, gameIndex) => (
                                    <div key={gameIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm font-medium text-gray-700">
                                          {game.opponent}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(game.time).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-600 mb-2">
                                        {game.location} • {new Date(game.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                                                             <div className="flex justify-between items-center">
                                         <div className="text-sm">
                                           {game.score?.home?.final !== undefined && game.score?.away?.final !== undefined ? (
                                             <span className="font-semibold">
                                               {game.score.home.final} - {game.score.away.final}
                                             </span>
                                           ) : (
                                             <span className="text-gray-500">No score</span>
                                           )}
                                         </div>
                                         <button
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             handleStartScoreEdit(schoolId, selectedSport, gameIndex, game);
                                           }}
                                           className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                         >
                                           {game.score?.home?.final !== undefined ? 'Edit Score' : 'Add Score'}
                                         </button>
                                       </div>
                                       
                                       {/* Game Notes Display */}
                                       {game.notes && (
                                         <div className="mt-2 pt-2 border-t border-gray-200">
                                           <div className="text-xs text-gray-600 font-medium mb-1">Game Notes:</div>
                                           <div className="text-xs text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
                                             {game.notes}
                                           </div>
                                         </div>
                                       )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'addArticle' && (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold text-primary-700 mb-6">Add Article</h2>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={articleForm.title}
                      onChange={(e) => handleArticleChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Category *</label>
                    <select
                      value={articleForm.category}
                      onChange={(e) => handleArticleChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Sports">Sports</option>
                      <option value="News">News</option>
                      <option value="Events">Events</option>
                      <option value="Announcements">Announcements</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-1">Excerpt *</label>
                  <textarea
                    value={articleForm.excerpt}
                    onChange={(e) => handleArticleChange('excerpt', e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Brief excerpt of the article"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-1">Content *</label>
                  <textarea
                    value={articleForm.content}
                    onChange={(e) => handleArticleChange('content', e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={8}
                    placeholder="Full article content"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-1">Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArticleImageChange}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={handleAddArticle}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Add Article
                </button>
              </div>

              {/* Articles List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary-700 mb-4">Current Articles</h3>
                                 <div className="space-y-4">
                   {articles.filter((article: any) => !article.archived).map((article, idx) => (
                    <div key={article.id} className="border border-primary-200 rounded-lg p-4">
                      <div className="font-bold text-primary-700 text-lg">{article.title}</div>
                      <div className="text-primary-500 text-sm mb-1">{article.category} | {article.date}</div>
                      <div className="text-primary-600">{article.excerpt}</div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleArchiveArticle(idx)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archived Articles */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-xl font-bold text-primary-700 mb-4">Archived Articles</h3>
                                 <div className="space-y-4">
                   {articles.filter((article: any) => article.archived).map((article, idx) => (
                    <div key={article.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="font-bold text-gray-700 text-lg">{article.title}</div>
                      <div className="text-gray-500 text-sm mb-1">{article.category} | {article.date}</div>
                      <div className="text-gray-600">{article.excerpt}</div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleDeleteArchivedArticle(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete Permanently
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'addRoster' && (
            <AdminAddRoster schools={schools} />
          )}
          {activeTab === 'addStats' && (
            <div className="w-full max-w-6xl">
              <h2 className="text-2xl font-bold text-primary-700 mb-6">Manage Sports Rankings</h2>
              
              {/* Sport Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Select Sport</label>
                    <select
                      value={selectedSport}
                      onChange={(e) => {
                        setSelectedSport(e.target.value);
                        setSelectedDivision('');
                      }}
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Choose a sport</option>
                      <option value="football">Football</option>
                      <option value="golf-boys">Men's Golf</option>
                      <option value="golf-girls">Women's Golf</option>
                      <option value="boys-soccer">Boys Soccer</option>
                      <option value="girls-soccer">Girls Soccer</option>
                      <option value="boys-cross-country">Boys Cross Country</option>
                      <option value="girls-cross-country">Girls Cross Country</option>
                      <option value="volleyball">Women's Volleyball</option>
                      <option value="tennis">Women's Tennis</option>
                    </select>
                  </div>
                  
                  {selectedSport && (
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Select Division/Cluster</label>
                      <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Choose a division/cluster</option>
                        {sportDivisions[selectedSport as keyof typeof sportDivisions]?.map((division) => (
                          <option key={division} value={division}>
                            {division.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Rankings Table */}
              {selectedSport && selectedDivision ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-green-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-green-600">
                        <th className="px-4 py-3 text-left text-white font-bold uppercase bg-primary-500">Team</th>
                        <th className="px-4 py-3 text-center text-white font-bold uppercase bg-primary-500">Wins</th>
                        <th className="px-4 py-3 text-center text-white font-bold uppercase bg-primary-500">Losses</th>
                        <th className="px-4 py-3 text-center text-white font-bold uppercase bg-primary-500">Win %</th>
                        <th className="px-4 py-3 text-center text-white font-bold uppercase bg-primary-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                            Loading stats...
                          </td>
                        </tr>
                      ) : (
                        (teamData as any)[selectedSport]?.[selectedDivision]?.map((team: string, _index: number) => {
                          const inputs = teamStatsInputs[team] || { wins: 0, losses: 0 };
                          const winPercentage = inputs.wins + inputs.losses > 0 
                            ? (inputs.wins / (inputs.wins + inputs.losses)).toFixed(3)
                            : '0.000';
                          
                          return (
                            <tr key={team} className={`even:bg-orange-50 odd:bg-green-50 border-b border-orange-300`}>
                              <td className="px-4 py-3 font-semibold text-green-900 whitespace-nowrap">{team}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 text-center border border-primary-200 rounded px-2 py-1 text-orange-600 font-bold"
                                  value={inputs.wins}
                                  onChange={(e) => handleStatsInputChange(team, 'wins', e.target.value)}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 text-center border border-primary-200 rounded px-2 py-1 text-orange-600 font-bold"
                                  value={inputs.losses}
                                  onChange={(e) => handleStatsInputChange(team, 'losses', e.target.value)}
                                />
                              </td>
                              <td className="px-4 py-3 text-center text-green-700 font-bold">{winPercentage}</td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  onClick={() => handleUpdateTeamStats(team)}
                                >
                                  Update
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-primary-600 text-lg">
                    {!selectedSport ? 'Please select a sport first' :
                     !selectedDivision ? 'Please select a division to view teams' :
                     'No teams found for this selection'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Game Modal */}
      {showEditModal && editingGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-primary-700">
                  {editingGameIndex !== null ? 'Edit Game Scores' : 'Edit Game'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Game Info Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <div className="text-sm text-gray-900">
                        {new Date(editingGame.time).toLocaleDateString()} at {new Date(editingGame.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <div className="text-sm text-gray-900">{editingGame.location}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
                    <div className="text-sm text-gray-900">{editingGame.opponent}</div>
                  </div>
                </div>
                
                                 {/* Score Input Section */}
                 <div className="border-t pt-4">
                   <h3 className="text-lg font-semibold text-primary-700 mb-4">Update Scores</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Home Team Score */}
                     <div>
                       <div className="text-sm font-medium text-primary-600 mb-2">Home Team Score</div>
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <label className="text-sm font-medium text-green-700">Final Score:</label>
                           <input
                             type="number"
                             min="0"
                             placeholder="0"
                             value={scoreInputs.home?.final || ''}
                             onChange={e => setScoreInputs((prev: any) => ({
                               ...prev,
                               home: { ...prev.home, final: e.target.value }
                             }))}
                             className="w-20 h-10 text-center border rounded text-sm font-bold bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                           />
                         </div>
                       </div>
                     </div>
                     
                     {/* Away Team Score */}
                     <div>
                       <div className="text-sm font-medium text-primary-600 mb-2">Away Team Score</div>
                       <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <label className="text-sm font-medium text-green-700">Final Score:</label>
                           <input
                             type="number"
                             min="0"
                             placeholder="0"
                             value={scoreInputs.away?.final || ''}
                             onChange={e => setScoreInputs((prev: any) => ({
                               ...prev,
                               away: { ...prev.away, final: e.target.value }
                             }))}
                             className="w-20 h-10 text-center border rounded text-sm font-bold bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Game Notes Section */}
                 <div className="border-t pt-4">
                   <h3 className="text-lg font-semibold text-primary-700 mb-4">Game Notes</h3>
                   <div>
                     <label className="block text-sm font-medium text-primary-700 mb-2">
                       Additional Notes (Optional)
                     </label>
                     <textarea
                       value={gameNotes}
                       onChange={(e) => setGameNotes(e.target.value)}
                       placeholder="Enter any notes about the game (e.g., weather conditions, key plays, injuries, etc.)"
                       rows={4}
                       className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                     />
                   </div>
                 </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200" 
                    onClick={handleSaveScores}
                  >
                    Save Scores
                  </button>
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-200" 
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 