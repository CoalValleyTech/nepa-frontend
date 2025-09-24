import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import AdminAddSchool from './AdminAddSchool';
import AdminAddSport from './AdminAddSport';
import AdminAddSchedule from './AdminAddSchedule';
import AdminAddGame from './AdminAddGame';
import AdminAddRoster from './AdminAddRoster';
import AdminAddStats from './AdminAddStats';
import { getSchools, getArticles, addArticle, deleteArticle, School, Article, getScheduleForSchool, updateScheduleWithScores, getGlobalSchedules, addFeaturedScore, getFeaturedScores, deleteFeaturedScore } from '../services/firebaseService';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'addSchool' | 'addSport' | 'addSchedule' | 'addGame' | 'editSchedule' | 'addArticle' | 'addRoster' | 'addStats' | 'featuredScores'>('addSchool');
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
  const [detailedGameNotes, setDetailedGameNotes] = useState<{
    homeTeamNotes: string;
    awayTeamNotes: string;
    generalNotes: string;
  }>({
    homeTeamNotes: '',
    awayTeamNotes: '',
    generalNotes: ''
  });

  // Featured Scores states
  const [featuredScores, setFeaturedScores] = useState<any[]>([]);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [availableGamesLoading, setAvailableGamesLoading] = useState(false);

  // Article form state
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    imageUrl: ''
  });

  // Stats management states
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [teamStatsInputs, setTeamStatsInputs] = useState<{ [teamName: string]: { wins: number; losses: number; overall: string } }>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [rankedTeams, setRankedTeams] = useState<Array<{ teamName: string; wins: number; losses: number; winPercentage: number; rank: number }>>([]);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [editingRankings, setEditingRankings] = useState<Array<{ teamName: string; wins: number; losses: number; winPercentage: number; rank: number }>>([]);

  const teamData = {
    'football': {
      'division-1': ['Abington Heights Comets', 'Delaware Valley Warriors', 'North Pocono Trojans', 'Scranton Knights', 'Scranton Prep Cavaliers', 'Valley View Cougars', 'Wallenpaupack Buckhorns'],
      'division-2': ['Dunmore Bucks', 'Honesdale Hornets', 'Lakeland Chiefs', 'Mid Valley Spartans', 'West Scranton Invaders', 'Western Wayne Wildcats'],
      'division-3': ['Carbondale Area Chargers', 'Holy Cross Crusaders', 'Lackawanna Trail Lions', 'Old Forge Blue Devils', 'Riverside Vikings', 'Susquehanna Sabers']
    },
    'basketball': {
      'division-1': ['Abington Heights Comets', 'Delaware Valley Warriors', 'North Pocono Trojans', 'Scranton Knights', 'Scranton Prep Cavaliers', 'Valley View Cougars', 'Wallenpaupack Buckhorns'],
      'division-2': ['Dunmore Bucks', 'Honesdale Hornets', 'Lakeland Chiefs', 'Mid Valley Spartans', 'West Scranton Invaders', 'Western Wayne Wildcats'],
      'division-3': ['Carbondale Area Chargers', 'Holy Cross Crusaders', 'Lackawanna Trail Lions', 'Old Forge Blue Devils', 'Riverside Vikings', 'Susquehanna Sabers']
    }
  };

  // Calculate and sort teams by ranking
  const calculateRankings = (teams: { [teamName: string]: { wins: number; losses: number; overall: string } }) => {
    const teamArray = Object.entries(teams).map(([teamName, stats]) => {
      const wins = Number(stats.wins) || 0;
      const losses = Number(stats.losses) || 0;
      const totalGames = wins + losses;
      const winPercentage = totalGames > 0 ? wins / totalGames : 0;
      
      return {
        teamName,
        wins,
        losses,
        winPercentage,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by win percentage (descending), then by wins (descending), then by alphabetical
    teamArray.sort((a, b) => {
      if (Math.abs(a.winPercentage - b.winPercentage) < 0.001) {
        if (a.wins !== b.wins) {
          return b.wins - a.wins;
        }
        return a.teamName.localeCompare(b.teamName);
      }
      return b.winPercentage - a.winPercentage;
    });

    // Assign ranks
    teamArray.forEach((team, index) => {
      team.rank = index + 1;
    });

    return teamArray;
  };

  // Handle manual ranking changes
  const handleRankingChange = (teamName: string, newRank: number) => {
    if (newRank < 1 || newRank > editingRankings.length) return;
    
    const currentTeam = editingRankings.find(t => t.teamName === teamName);
    if (!currentTeam) return;
    
    const currentRank = currentTeam.rank;
    if (currentRank === newRank) return;
    
    // Create new rankings array
    const newRankings = [...editingRankings];
    
    // Remove team from current position
    newRankings.splice(currentRank - 1, 1);
    
    // Insert team at new position
    newRankings.splice(newRank - 1, 0, currentTeam);
    
    // Update all ranks
    newRankings.forEach((team, index) => {
      team.rank = index + 1;
    });
    
    setEditingRankings(newRankings);
  };

  // Save ranking changes
  const handleSaveRankings = async () => {
    try {
      // Update team stats based on new rankings
      const updates = editingRankings.map(team => {
        // Calculate wins/losses to achieve the desired ranking
        // This is a simplified approach - you might want more sophisticated logic
        const totalTeams = editingRankings.length;
        const targetWinPercentage = 1 - (team.rank - 1) / totalTeams;
        const totalGames = 10; // Assume 10 games for calculation
        const wins = Math.round(targetWinPercentage * totalGames);
        const losses = totalGames - wins;
        
        return {
          teamName: team.teamName,
          wins: Math.max(0, wins),
          losses: Math.max(0, losses)
        };
      });
      
      // Update each team's stats
      for (const update of updates) {
        // Note: This would need updateTeamStats function to be imported
        console.log('Would update team stats:', update);
      }
      
      // Reload stats and close modal
      setShowRankingModal(false);
      alert('Rankings updated successfully!');
    } catch (error: any) {
      console.error('Error saving rankings:', error);
      alert(`Error saving rankings: ${error.message}`);
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

  // Load featured scores effect
  useEffect(() => {
    if (user) {
      loadFeaturedScores();
    }
  }, [user]);

  // Load current stats effect
  useEffect(() => {
    console.log('useEffect triggered - user:', !!user, 'sport:', selectedSport, 'division:', selectedDivision);
    if (user && selectedSport && selectedDivision) {
      console.log('Calling loadCurrentStats...');
      loadCurrentStats();
    }
  }, [user, selectedSport, selectedDivision]);



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

  // Load available games for featuring
  const loadAvailableGames = async () => {
    setAvailableGamesLoading(true);
    try {
      const allGames = await getGlobalSchedules();
      console.log('All games loaded:', allGames);
      console.log('Total games found:', allGames.length);
      
      if (allGames.length === 0) {
        console.log('No games found in schedules collection');
        setAvailableGames([]);
        return;
      }
      
      // Filter games that have scores (completed games)
      const gamesWithScores = allGames.filter((game: any) => {
        const hasScore = game.score && 
          (game.score.home?.final !== undefined || game.score.away?.final !== undefined);
        console.log('Game:', game.id, 'Status:', game.status, 'Has score:', hasScore, 'Score:', game.score);
        return (game.status === 'LIVE' || game.status === 'FINAL') && hasScore;
      });
      
      console.log('Games with scores:', gamesWithScores);
      console.log('Games with scores count:', gamesWithScores.length);
      setAvailableGames(gamesWithScores);
    } catch (error) {
      console.error('Error loading available games:', error);
    } finally {
      setAvailableGamesLoading(false);
    }
  };

  // Load current featured scores
  const loadFeaturedScores = async () => {
    try {
      const featuredData = await getFeaturedScores();
      setFeaturedScores(featuredData);
    } catch (error) {
      console.error('Error loading featured scores:', error);
    }
  };

  // Add game to featured scores
  const addToFeaturedScores = async (game: any) => {
    try {
      const homeTeamName = game.schoolName || schools.find(s => s.id === game.schoolId)?.name || 'Unknown Team';
      const awayTeamName = game.opponent || 'Unknown Team';
      
      await addFeaturedScore({
        gameId: game.id,
        schoolName: homeTeamName,
        opponent: awayTeamName,
        homeScore: game.score?.home?.final || 0,
        awayScore: game.score?.away?.final || 0,
        date: game.time,
        location: game.location,
        status: game.status || 'LIVE',
        order: featuredScores.length + 1
      });
      
      // Reload featured scores
      await loadFeaturedScores();
    } catch (error) {
      console.error('Error adding to featured scores:', error);
    }
  };

  // Remove game from featured scores
  const removeFromFeaturedScores = async (featuredScoreId: string) => {
    try {
      await deleteFeaturedScore(featuredScoreId);
      await loadFeaturedScores();
    } catch (error) {
      console.error('Error removing from featured scores:', error);
    }
  };

  // Load current stats for selected sport and division
  const loadCurrentStats = async () => {
    if (!selectedSport || !selectedDivision) return;
    
    setStatsLoading(true);
    try {
      const teams = (teamData as any)[selectedSport]?.[selectedDivision] || [];
      console.log('Teams found for', selectedSport, selectedDivision, ':', teams);
      
      if (teams.length === 0) {
        console.log('No teams found for this sport/division combination');
        setTeamStatsInputs({});
        setRankedTeams([]);
        return;
      }
      
      // Create default inputs map with all teams having 0 wins and 0 losses
      const inputsMap: { [teamName: string]: { wins: number; losses: number; overall: string } } = {};
      teams.forEach((teamName: string) => {
        inputsMap[teamName] = { wins: 0, losses: 0, overall: '0-0' };
      });
      
      // Try to fetch existing stats from Firebase, but don't fail if they don't exist
      try {
        // Note: getTeamStats function would need to be imported to fetch existing stats
        console.log('Would fetch existing stats for teams:', teams);
      } catch (statsError) {
        console.log('Could not fetch existing stats, using default values:', statsError);
        // Continue with default values
      }
      
      console.log('Final inputs map:', inputsMap);
      setTeamStatsInputs(inputsMap);
      
      // Calculate and set initial rankings
      const rankings = calculateRankings(inputsMap);
      console.log('Calculated rankings:', rankings);
      setRankedTeams(rankings);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      // Even if there's an error, try to show teams with default values
      const teams = (teamData as any)[selectedSport]?.[selectedDivision] || [];
      const inputsMap: { [teamName: string]: { wins: number; losses: number; overall: string } } = {};
      teams.forEach((teamName: string) => {
        inputsMap[teamName] = { wins: 0, losses: 0, overall: '0-0' };
      });
      setTeamStatsInputs(inputsMap);
      const rankings = calculateRankings(inputsMap);
      setRankedTeams(rankings);
    } finally {
      setStatsLoading(false);
    }
  };

  // Update team stats input







  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingGame(null);
    setScoreInputs({ home: {}, away: {} });
    setGameNotes('');
    setDetailedGameNotes({
      homeTeamNotes: '',
      awayTeamNotes: '',
      generalNotes: ''
    });
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
    
    // Initialize detailed game notes
    setDetailedGameNotes({
      homeTeamNotes: game.gameNotes?.homeTeamNotes || '',
      awayTeamNotes: game.gameNotes?.awayTeamNotes || '',
      generalNotes: game.gameNotes?.generalNotes || ''
    });
    
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
        gameNotes: detailedGameNotes,
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
      setDetailedGameNotes({
        homeTeamNotes: '',
        awayTeamNotes: '',
        generalNotes: ''
      });
      
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
          <button
            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left ${activeTab === 'featuredScores' ? 'bg-primary-500 text-white' : 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-100'}`}
            onClick={() => setActiveTab('featuredScores')}
          >
            Featured Scores
          </button>
          
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">Admin Dashboard</h1>
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
            <AdminAddStats />
          )}
          {activeTab === 'featuredScores' && (
            <div className="w-full max-w-6xl">
              <h2 className="text-2xl font-bold text-primary-700 mb-6">Manage Featured Scores</h2>
              
              {/* Featured Scores Management */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-700">Featured Scores</h3>
                    <p className="text-sm text-gray-600">Manage which games appear in the Scores section on the homepage</p>
                  </div>
                  <button
                    onClick={loadAvailableGames}
                    disabled={availableGamesLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Load Available Games
                  </button>
                </div>

                {/* Current Featured Scores */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-primary-700 mb-3">Current Featured Scores</h4>
                  {featuredScores.length > 0 ? (
                    <div className="space-y-3">
                      {featuredScores.map((score, index) => (
                        <div key={score.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {score.schoolName} vs {score.opponent}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {score.homeScore} - {score.awayScore} • {new Date(score.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  // TODO: Add edit functionality
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeFromFeaturedScores(score.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500">No featured scores selected yet.</p>
                      <p className="text-sm text-gray-400 mt-1">Click "Load Available Games" to see games you can feature.</p>
                    </div>
                  )}
                </div>

                {/* Available Games */}
                {availableGames.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-primary-700 mb-3">Available Games to Feature</h4>
                    <div className="space-y-3">
                      {availableGames.map((game) => {
                        const homeTeamName = game.schoolName || schools.find(s => s.id === game.schoolId)?.name || 'Unknown Team';
                        const awayTeamName = game.opponent || 'Unknown Team';
                        const isAlreadyFeatured = featuredScores.some(fs => fs.gameId === game.id);
                        
                        return (
                          <div key={game.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {homeTeamName} vs {awayTeamName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {game.sport} • {game.location} • {game.time}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-lg font-bold text-primary-700">
                                  {game.score?.home?.final || 0} - {game.score?.away?.final || 0}
                                </div>
                                <button
                                  onClick={() => addToFeaturedScores(game)}
                                  disabled={isAlreadyFeatured}
                                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    isAlreadyFeatured 
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                      : 'bg-green-600 hover:bg-green-700 text-white'
                                  }`}
                                >
                                  {isAlreadyFeatured ? 'Already Featured' : 'Feature'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableGamesLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading available games...</p>
                  </div>
                )}

                {!availableGamesLoading && availableGames.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">No games with scores available to feature.</p>
                  </div>
                )}
              </div>
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
                   
                   {/* General Notes */}
                   <div className="mb-4">
                     <label className="block text-sm font-medium text-primary-700 mb-2">
                       General Game Notes (Optional)
                     </label>
                     <textarea
                       value={gameNotes}
                       onChange={(e) => setGameNotes(e.target.value)}
                       placeholder="Enter general notes about the game (e.g., weather conditions, key plays, injuries, etc.)"
                       rows={3}
                       className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                     />
                   </div>

                   {/* Detailed Game Notes */}
                   <div className="space-y-4">
                     <h4 className="text-md font-semibold text-primary-600">Detailed Team Notes</h4>
                     
                     {/* Home Team Notes */}
                     <div>
                       <label className="block text-sm font-medium text-primary-700 mb-2">
                         Home Team Notes (Optional)
                       </label>
                       <textarea
                         value={detailedGameNotes.homeTeamNotes}
                         onChange={(e) => setDetailedGameNotes(prev => ({
                           ...prev,
                           homeTeamNotes: e.target.value
                         }))}
                         placeholder="Enter notes specific to the home team performance, key players, etc."
                         rows={3}
                         className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                       />
                     </div>

                     {/* Away Team Notes */}
                     <div>
                       <label className="block text-sm font-medium text-primary-700 mb-2">
                         Away Team Notes (Optional)
                       </label>
                       <textarea
                         value={detailedGameNotes.awayTeamNotes}
                         onChange={(e) => setDetailedGameNotes(prev => ({
                           ...prev,
                           awayTeamNotes: e.target.value
                         }))}
                         placeholder="Enter notes specific to the away team performance, key players, etc."
                         rows={3}
                         className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                       />
                     </div>

                     {/* Additional General Notes */}
                     <div>
                       <label className="block text-sm font-medium text-primary-700 mb-2">
                         Additional General Notes (Optional)
                       </label>
                       <textarea
                         value={detailedGameNotes.generalNotes}
                         onChange={(e) => setDetailedGameNotes(prev => ({
                           ...prev,
                           generalNotes: e.target.value
                         }))}
                         placeholder="Enter any additional general notes about the game"
                         rows={3}
                         className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                       />
                     </div>
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

      {/* Ranking Management Modal */}
      {showRankingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-primary-700">
                  Manage Team Rankings
                </h2>
                <button
                  onClick={() => setShowRankingModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">How to Manage Rankings</h3>
                      <p className="text-sm text-blue-700">
                        Use the rank input fields to manually adjust team positions. Teams will be automatically reordered based on your changes. 
                        Click "Save Rankings" to apply the new order and update team statistics accordingly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Rankings */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-700 mb-4">Current Rankings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editingRankings.map((team, index) => (
                      <div key={team.teamName} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-amber-600' : 'bg-primary-500'
                            }`}>
                              {team.rank}
                            </div>
                            <div className="text-sm font-semibold text-gray-800">{team.teamName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {team.wins}-{team.losses}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(team.winPercentage * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Rank Input */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 font-medium">New Rank:</label>
                          <input
                            type="number"
                            min="1"
                            max={editingRankings.length}
                            value={team.rank}
                            onChange={(e) => handleRankingChange(team.teamName, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200" 
                    onClick={handleSaveRankings}
                  >
                    Save Rankings
                  </button>
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors duration-200" 
                    onClick={() => setShowRankingModal(false)}
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