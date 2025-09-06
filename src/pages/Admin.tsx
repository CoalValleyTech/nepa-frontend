import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import AdminAddSchool from './AdminAddSchool';
import AdminAddSport from './AdminAddSport';
import AdminAddSchedule from './AdminAddSchedule';
import AdminAddGame from './AdminAddGame';
import AdminAddRoster from './AdminAddRoster';
import { getSchools, getArticles, addArticle, deleteArticle, School, Article, updateTeamStats, getTeamStats, TeamStats, getScheduleForSchool, updateScheduleWithScores, getGlobalSchedules, addFeaturedScore, getFeaturedScores, deleteFeaturedScore } from '../services/firebaseService';
import { initializeSampleData } from '../initSampleData';

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

  // Add Stats states
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [teamStatsInputs, setTeamStatsInputs] = useState<{ [teamName: string]: { wins: number; losses: number; overall: string } }>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [rankedTeams, setRankedTeams] = useState<Array<{ teamName: string; wins: number; losses: number; winPercentage: number; rank: number }>>([]);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [editingRankings, setEditingRankings] = useState<Array<{ teamName: string; wins: number; losses: number; winPercentage: number; rank: number }>>([]);

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

  const sportDivisions = {
    'football': ['division-1', 'division-2', 'division-3'],
    'golf-boys': ['division-1', 'division-2'],
    'golf-girls': ['division-1', 'division-2'],
    'boys-soccer': ['division-1', 'division-2', 'division-3'],
    'girls-soccer': ['division-1', 'division-2'],
    'boys-cross-country': ['cluster-1', 'cluster-2', 'cluster-3', 'cluster-4', 'cluster-5', 'cluster-6', 'cluster-7', 'cluster-8'],
    'girls-cross-country': ['cluster-1', 'cluster-2', 'cluster-3', 'cluster-4', 'cluster-5', 'cluster-6', 'cluster-7', 'cluster-8'],
    'volleyball': ['division-1', 'division-2'],
    'tennis': ['division-1', 'division-2'],
    'basketball': ['division-1', 'division-2', 'division-3'],
    'baseball': ['division-1', 'division-2', 'division-3'],
    'softball': ['division-1', 'division-2', 'division-3'],
    'track': ['division-1', 'division-2', 'division-3'],
    'swimming': ['division-1', 'division-2'],
    'wrestling': ['division-1', 'division-2', 'division-3'],
    'field-hockey': ['division-1', 'division-2'],
    'lacrosse': ['division-1', 'division-2']
  };

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
    },
    'baseball': {
      'division-1': ['Abington Heights Comets', 'Delaware Valley Warriors', 'North Pocono Trojans', 'Scranton Knights', 'Scranton Prep Cavaliers', 'Valley View Cougars', 'Wallenpaupack Buckhorns'],
      'division-2': ['Dunmore Bucks', 'Honesdale Hornets', 'Lakeland Chiefs', 'Mid Valley Spartans', 'West Scranton Invaders', 'Western Wayne Wildcats'],
      'division-3': ['Carbondale Area Chargers', 'Holy Cross Crusaders', 'Lackawanna Trail Lions', 'Old Forge Blue Devils', 'Riverside Vikings', 'Susquehanna Sabers']
    },
    'softball': {
      'division-1': ['Abington Heights Comets', 'Delaware Valley Warriors', 'North Pocono Trojans', 'Scranton Knights', 'Scranton Prep Cavaliers', 'Valley View Cougars', 'Wallenpaupack Buckhorns'],
      'division-2': ['Dunmore Bucks', 'Honesdale Hornets', 'Lakeland Chiefs', 'Mid Valley Spartans', 'West Scranton Invaders', 'Western Wayne Wildcats'],
      'division-3': ['Carbondale Area Chargers', 'Holy Cross Crusaders', 'Lackawanna Trail Lions', 'Old Forge Blue Devils', 'Riverside Vikings', 'Susquehanna Sabers']
    },
    'volleyball': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton', 'Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside'],
      'division-2': ['Blue Ridge', 'Mt. View', 'Elk Lake', 'Forest City', 'Susquehanna', 'Carbondale', 'Old Forge', 'Riverside']
    },
    'tennis': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton', 'Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside'],
      'division-2': ['Blue Ridge', 'Mt. View', 'Elk Lake', 'Forest City', 'Susquehanna', 'Carbondale', 'Old Forge', 'Riverside']
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
    'track': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton'],
      'division-2': ['Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside'],
      'division-3': ['Blue Ridge', 'Mt. View', 'Elk Lake', 'Forest City', 'Susquehanna', 'Carbondale', 'Lackawanna Trail', 'Montrose']
    },
    'swimming': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton'],
      'division-2': ['Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside']
    },
    'wrestling': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton'],
      'division-2': ['Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside'],
      'division-3': ['Blue Ridge', 'Mt. View', 'Elk Lake', 'Forest City', 'Susquehanna', 'Carbondale', 'Lackawanna Trail', 'Montrose']
    },
    'field-hockey': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton'],
      'division-2': ['Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside']
    },
    'lacrosse': {
      'division-1': ['Abington Heights', 'North Pocono', 'Scranton Prep', 'Delaware Valley', 'Valley View', 'Wallenpaupack', 'Scranton', 'West Scranton'],
      'division-2': ['Honesdale', 'Dunmore', 'Lakeland', 'Mid Valley', 'Western Wayne', 'Old Forge', 'Holy Cross', 'Riverside']
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
    'golf-boys': {
      'division-1': ['Scranton Prep', 'Abington Heights', 'Honesdale', 'North Pocono', 'Delaware Valley', 'Wallenpaupack'],
      'division-2': ['Lackawanna Trail', 'Riverside', 'Lakeland', 'Mid Valley', 'Dunmore', 'Western Wayne', 'Blue Ridge', 'Old Forge', 'Montrose', 'Holy Cross', 'Mt. View', 'West Scranton', 'Scranton', 'Elk Lake', 'Forest City', 'Carbondale']
    },
    'golf-girls': {
      'division-1': ['Scranton Prep', 'Abington Heights', 'Honesdale', 'North Pocono', 'Delaware Valley', 'Wallenpaupack'],
      'division-2': ['Lackawanna Trail', 'Riverside', 'Lakeland', 'Mid Valley', 'Dunmore', 'Western Wayne', 'Blue Ridge', 'Old Forge', 'Montrose', 'Holy Cross', 'Mt. View', 'West Scranton', 'Scranton', 'Elk Lake', 'Forest City', 'Carbondale']
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

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Initialize sample data function
  const handleInitializeSampleData = async () => {
    try {
      if (window.confirm('This will add sample schools and articles to your database. Continue?')) {
        await initializeSampleData();
        alert('Sample data initialized successfully! Please refresh the page to see the new data.');
        // Reload the data
        loadSchools();
        loadArticles();
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      alert('Error initializing sample data. Please check the console for details.');
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
        const statsPromises = teams.map((teamName: string) => 
          getTeamStats(teamName, selectedSport, selectedDivision)
        );
        
        const statsResults = await Promise.all(statsPromises);
        
        // Update inputs map with existing stats if available
        teams.forEach((teamName: string, index: number) => {
          const stats = statsResults[index];
          if (stats && stats.wins !== undefined && stats.losses !== undefined) {
            inputsMap[teamName] = { 
              wins: Number(stats.wins) || 0, 
              losses: Number(stats.losses) || 0,
              overall: stats.overall || `${Number(stats.wins) || 0}-${Number(stats.losses) || 0}`
            };
          }
        });
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
  const handleStatsInputChange = (teamName: string, field: 'wins' | 'losses' | 'overall', value: string) => {
    console.log('handleStatsInputChange called:', { teamName, field, value });
    
    setTeamStatsInputs(prev => {
      const newState = {
        ...prev,
        [teamName]: {
          ...prev[teamName],
          [field]: field === 'overall' ? value : (value === '' ? 0 : (parseInt(value) || 0))
        }
      };
      console.log('New state:', newState);
      return newState;
    });
    
    // Also update the rankedTeams to reflect the change immediately (only for wins/losses)
    if (field !== 'overall') {
      setRankedTeams(prev => {
        const updated = prev.map(team => {
          if (team.teamName === teamName) {
            const currentInputs = teamStatsInputs[teamName] || { wins: 0, losses: 0 };
            const numValue = value === '' ? 0 : (parseInt(value) || 0);
            const newWins = field === 'wins' ? numValue : currentInputs.wins;
            const newLosses = field === 'losses' ? numValue : currentInputs.losses;
            const totalGames = newWins + newLosses;
            const winPercentage = totalGames > 0 ? newWins / totalGames : 0;
          
          return {
            ...team,
            wins: newWins,
            losses: newLosses,
            winPercentage
          };
        }
        return team;
      });
      
      // Re-sort and re-rank the teams
      const sorted = updated.sort((a, b) => {
        if (Math.abs(a.winPercentage - b.winPercentage) < 0.001) {
          if (a.wins !== b.wins) {
            return b.wins - a.wins;
          }
          return a.teamName.localeCompare(b.teamName);
        }
        return b.winPercentage - a.winPercentage;
      });
      
      // Reassign ranks
      sorted.forEach((team, index) => {
        team.rank = index + 1;
      });
      
      return sorted;
    });
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

  // Update team stats in Firebase
  const handleUpdateTeamStats = async (teamName: string) => {
    if (!selectedSport || !selectedDivision) {
      alert('Please select both a sport and division first');
      return;
    }
    
    // Double-check authentication
    if (!user || !user.uid) {
      alert('Authentication error: Please log in again');
      console.error('No user or user.uid found:', user);
      return;
    }
    
    try {
      const inputs = teamStatsInputs[teamName];
      if (!inputs) {
        // If inputs don't exist, create default values
        setTeamStatsInputs(prev => ({
          ...prev,
          [teamName]: { wins: 0, losses: 0, overall: '0-0' }
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
        overall: inputs.overall || `${wins}-${losses}`,
        winPercentage: 0, // Will be calculated in the service
        season: '2024-25'
      };
      
      console.log('=== SAVING TEAM STATS ===');
      console.log('Current user:', user.email);
      console.log('User UID:', user.uid);
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
      
      // Provide more specific error messages
      if (error.message.includes('permission')) {
        alert('Permission denied. Please check your authentication status and try logging out and back in.');
      } else if (error.message.includes('not authenticated')) {
        alert('Authentication error. Please log out and log back in.');
      } else {
        alert(`Error updating stats: ${error.message}`);
      }
    }
  };

  // Open ranking management modal
  const handleOpenRankingModal = () => {
    const rankings = calculateRankings(teamStatsInputs);
    setRankedTeams(rankings);
    setEditingRankings([...rankings]);
    setShowRankingModal(true);
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
        const teamStats: TeamStats = {
          teamName: update.teamName,
          sport: selectedSport,
          division: selectedDivision,
          wins: update.wins,
          losses: update.losses,
          overall: `${update.wins}-${update.losses}`,
          winPercentage: 0,
          season: '2024-25'
        };
        
        await updateTeamStats(teamStats);
      }
      
      // Reload stats and close modal
      await loadCurrentStats();
      setShowRankingModal(false);
      alert('Rankings updated successfully!');
    } catch (error: any) {
      console.error('Error saving rankings:', error);
      alert(`Error saving rankings: ${error.message}`);
    }
  };





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
          
          {/* Sample Data Button */}
          <button
            onClick={handleInitializeSampleData}
            className="w-full px-6 py-3 rounded-lg font-semibold text-lg transition-colors text-left bg-green-600 text-white hover:bg-green-700 mt-4"
          >
            Initialize Sample Data
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
                         console.log('Sport selected:', e.target.value);
                         setSelectedSport(e.target.value);
                         setSelectedDivision('');
                       }}
                       className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                     >
                       <option value="">Choose a sport</option>
                       <option value="football">Football</option>
                       <option value="basketball">Basketball</option>
                       <option value="baseball">Baseball</option>
                       <option value="softball">Softball</option>
                       <option value="volleyball">Volleyball</option>
                       <option value="tennis">Tennis</option>
                       <option value="boys-soccer">Boys Soccer</option>
                       <option value="girls-soccer">Girls Soccer</option>
                       <option value="boys-cross-country">Boys Cross Country</option>
                       <option value="girls-cross-country">Girls Cross Country</option>
                       <option value="track">Track & Field</option>
                       <option value="swimming">Swimming</option>
                       <option value="wrestling">Wrestling</option>
                       <option value="field-hockey">Field Hockey</option>
                       <option value="lacrosse">Lacrosse</option>
                       <option value="golf-boys">Men's Golf</option>
                       <option value="golf-girls">Women's Golf</option>
                     </select>
                  </div>
                  
                  {selectedSport && (
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Select Division/Cluster</label>
                                             <select
                         value={selectedDivision}
                         onChange={(e) => {
                           console.log('Division selected:', e.target.value);
                           setSelectedDivision(e.target.value);
                         }}
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
                
                {/* Ranking Management Actions */}
                {selectedSport && selectedDivision && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-primary-700 mb-2">Ranking Management</h3>
                        <p className="text-sm text-gray-600">
                          Manage team rankings and standings for {selectedSport.replace('-', ' ')} - {selectedDivision.replace('-', ' ')}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleOpenRankingModal}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          Manage Rankings
                        </button>
                                                 <button
                           onClick={() => {
                             const rankings = calculateRankings(teamStatsInputs);
                             setRankedTeams(rankings);
                           }}
                           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           Recalculate Rankings
                         </button>
                         <button
                           onClick={() => {
                             console.log('Manual load test');
                             loadCurrentStats();
                           }}
                           className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                           Test Load Stats
                         </button>
                         <button
                           onClick={() => {
                             console.log('Current teamStatsInputs:', teamStatsInputs);
                             console.log('Current rankedTeams:', rankedTeams);
                           }}
                           className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           Debug State
                         </button>
                                                   <button
                            onClick={async () => {
                              try {
                                console.log('=== AUTHENTICATION TEST ===');
                                console.log('React state user object:', user);
                                console.log('User email:', user?.email);
                                console.log('User UID:', user?.uid);
                                console.log('Auth state:', !!user);
                                
                                // Test Firebase auth directly
                                const { getAuth, onAuthStateChanged } = await import('firebase/auth');
                                const auth = getAuth();
                                
                                // Get current user immediately
                                const firebaseUser = auth.currentUser;
                                console.log('Firebase currentUser result:', firebaseUser);
                                
                                // Also listen for auth state changes
                                onAuthStateChanged(auth, (currentUser) => {
                                  console.log('Firebase auth state changed:', currentUser);
                                  if (currentUser) {
                                    console.log('Firebase user email:', currentUser.email);
                                    console.log('Firebase user UID:', currentUser.uid);
                                    console.log('Firebase user verified:', currentUser.emailVerified);
                                  }
                                });
                                
                                // Test if we can get the auth instance
                                console.log('Firebase auth instance:', auth);
                                console.log('Firebase auth current user:', auth.currentUser);
                                
                                if (firebaseUser) {
                                  alert(`✅ Authentication verified!\nEmail: ${firebaseUser.email}\nUID: ${firebaseUser.uid}\nVerified: ${firebaseUser.emailVerified}`);
                                } else {
                                  alert('❌ No authenticated user found in Firebase');
                                }
                              } catch (error: any) {
                                console.error('❌ Authentication test failed:', error);
                                alert(`Authentication test failed: ${error.message}`);
                              }
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Test Auth
                          </button>
                                                   <button
                            onClick={async () => {
                              try {
                                console.log('=== FIRESTORE WRITE TEST ===');
                                console.log('Testing basic Firestore write...');
                                console.log('Current user:', user?.email);
                                console.log('User UID:', user?.uid);
                                
                                // Test with a collection we know exists (teamStats)
                                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                                const { db } = await import('../firebase');
                                
                                // Create a test document in the teamStats collection
                                const testRef = doc(db, 'teamStats', 'write-test-' + Date.now());
                                await setDoc(testRef, {
                                  test: true,
                                  timestamp: serverTimestamp(),
                                  userId: user?.uid || 'unknown',
                                  userEmail: user?.email || 'unknown',
                                  testData: 'This is a test write to verify permissions'
                                });
                                
                                console.log('✅ Firestore write test successful!');
                                alert('Firestore write test successful! Document created in teamStats collection.');
                              } catch (error: any) {
                                console.error('❌ Firestore write test failed:', error);
                                console.error('Error details:', {
                                  message: error.message,
                                  code: error.code,
                                  stack: error.stack
                                });
                                
                                // Provide more specific error messages
                                if (error.code === 'permission-denied') {
                                  alert('Permission denied. This usually means:\n1. You are not properly authenticated\n2. The Firestore rules are blocking this operation\n\nTry logging out and back in.');
                                } else if (error.message.includes('permission')) {
                                  alert('Permission error. Please check your authentication status.');
                                } else {
                                  alert(`Firestore write test failed: ${error.message}\n\nError code: ${error.code}`);
                                }
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Test Write
                          </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Team Rankings Table */}
              {selectedSport && selectedDivision ? (
                <div className="space-y-6">
                  {/* Current Rankings Display */}
                  {rankedTeams.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Current Rankings
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {rankedTeams.map((team, index) => (
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
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                      <p className="text-gray-600">No teams loaded yet. Click "Test Load Stats" to load teams.</p>
                    </div>
                  )}

                  {/* Detailed Stats Table */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Detailed Statistics
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-green-50 border-b border-green-200">
                            <th className="px-4 py-3 text-left text-green-800 font-bold">Rank</th>
                            <th className="px-4 py-3 text-left text-green-800 font-bold">Team</th>
                            <th className="px-4 py-3 text-center text-green-800 font-bold">Wins</th>
                            <th className="px-4 py-3 text-center text-green-800 font-bold">Losses</th>
                            <th className="px-4 py-3 text-center text-green-800 font-bold">Overall</th>
                            <th className="px-4 py-3 text-center text-green-800 font-bold">Win %</th>
                            <th className="px-4 py-3 text-center text-green-800 font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statsLoading ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                                Loading stats...
                              </td>
                            </tr>
                          ) : rankedTeams.length > 0 ? (
                            rankedTeams.map((team) => {
                              const inputs = teamStatsInputs[team.teamName] || { wins: 0, losses: 0, overall: '0-0' };
                              
                              return (
                                <tr key={team.teamName} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                                  <td className="px-4 py-3 text-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                                      team.rank === 1 ? 'bg-yellow-500' : 
                                      team.rank === 2 ? 'bg-gray-400' : 
                                      team.rank === 3 ? 'bg-amber-600' : 'bg-primary-500'
                                    }`}>
                                      {team.rank}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-gray-900">{team.teamName}</td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      key={`${team.teamName}-wins-${inputs.wins}`}
                                      type="number"
                                      min="0"
                                      className="w-16 text-center border border-green-200 rounded px-2 py-1 text-green-600 font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={inputs.wins}
                                      onChange={(e) => {
                                        console.log('Wins input changed for', team.teamName, 'to', e.target.value);
                                        handleStatsInputChange(team.teamName, 'wins', e.target.value);
                                      }}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      key={`${team.teamName}-losses-${inputs.losses}`}
                                      type="number"
                                      min="0"
                                      className="w-16 text-center border border-green-200 rounded px-2 py-1 text-green-600 font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      value={inputs.losses}
                                      onChange={(e) => {
                                        console.log('Losses input changed for', team.teamName, 'to', e.target.value);
                                        handleStatsInputChange(team.teamName, 'losses', e.target.value);
                                      }}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      key={`${team.teamName}-overall-${inputs.overall || ''}`}
                                      type="text"
                                      placeholder="0-0"
                                      className="w-20 text-center border border-orange-200 rounded px-2 py-1 text-orange-600 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                      value={inputs.overall || ''}
                                      onChange={(e) => {
                                        console.log('Overall input changed for', team.teamName, 'to', e.target.value);
                                        handleStatsInputChange(team.teamName, 'overall', e.target.value);
                                      }}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center text-green-700 font-bold">
                                    {(team.winPercentage * 100).toFixed(1)}%
                                  </td>
                                                                      <td className="px-4 py-3 text-center">
                                      <button 
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        onClick={() => handleUpdateTeamStats(team.teamName)}
                                      >
                                        Update
                                      </button>
                                    </td>
                                </tr>
                              );
                            })
                          ) : (
                            // Fallback: Show teams from teamData even if rankedTeams is empty
                            (() => {
                              const teams = (teamData as any)[selectedSport]?.[selectedDivision] || [];
                              return teams.map((teamName: string, index: number) => {
                                const inputs = teamStatsInputs[teamName] || { wins: 0, losses: 0, overall: '0-0' };
                                const totalGames = inputs.wins + inputs.losses;
                                const winPercentage = totalGames > 0 ? inputs.wins / totalGames : 0;
                                
                                return (
                                  <tr key={teamName} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                                    <td className="px-4 py-3 text-center">
                                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs bg-primary-500">
                                        {index + 1}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">{teamName}</td>
                                                                       <td className="px-4 py-3 text-center">
                                     <input
                                       key={`${teamName}-wins-${inputs.wins}`}
                                       type="number"
                                       min="0"
                                       className="w-16 text-center border border-green-200 rounded px-2 py-1 text-green-600 font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                       value={inputs.wins}
                                       onChange={(e) => {
                                         console.log('Wins input changed for', teamName, 'to', e.target.value);
                                         handleStatsInputChange(teamName, 'wins', e.target.value);
                                       }}
                                       onBlur={(e) => {
                                         console.log('Wins input blurred for', teamName, 'value:', e.target.value);
                                       }}
                                     />
                                   </td>
                                   <td className="px-4 py-3 text-center">
                                     <input
                                       key={`${teamName}-losses-${inputs.losses}`}
                                       type="number"
                                       min="0"
                                       className="w-16 text-center border border-green-200 rounded px-2 py-1 text-green-600 font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                       value={inputs.losses}
                                       onChange={(e) => {
                                         console.log('Losses input changed for', teamName, 'to', e.target.value);
                                         handleStatsInputChange(teamName, 'losses', e.target.value);
                                       }}
                                       onBlur={(e) => {
                                         console.log('Losses input blurred for', teamName, 'value:', e.target.value);
                                       }}
                                     />
                                   </td>
                                   <td className="px-4 py-3 text-center">
                                     <input
                                       key={`${teamName}-overall-${inputs.overall || ''}`}
                                       type="text"
                                       placeholder="0-0"
                                       className="w-20 text-center border border-orange-200 rounded px-2 py-1 text-orange-600 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                       value={inputs.overall || ''}
                                       onChange={(e) => {
                                         console.log('Overall input changed for', teamName, 'to', e.target.value);
                                         handleStatsInputChange(teamName, 'overall', e.target.value);
                                       }}
                                     />
                                   </td>
                                    <td className="px-4 py-3 text-center text-green-700 font-bold">
                                      {(winPercentage * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <button 
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                        onClick={() => handleUpdateTeamStats(teamName)}
                                      >
                                        Update
                                      </button>
                                    </td>
                                  </tr>
                                );
                              });
                            })()
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-primary-600 text-lg">
                    {!selectedSport ? 'Please select a sport first' :
                     !selectedDivision ? 'Please select a division to view teams' :
                     'No teams found for this selection'}
                  </p>
                  {selectedSport && selectedDivision && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600">Debug Info:</p>
                      <p className="text-xs text-gray-500">Sport: {selectedSport}</p>
                      <p className="text-xs text-gray-500">Division: {selectedDivision}</p>
                      <p className="text-xs text-gray-500">Teams found: {(teamData as any)[selectedSport]?.[selectedDivision]?.length || 0}</p>
                      <p className="text-xs text-gray-500">Ranked teams: {rankedTeams.length}</p>
                      <p className="text-xs text-gray-500">Stats inputs: {Object.keys(teamStatsInputs).length}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
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