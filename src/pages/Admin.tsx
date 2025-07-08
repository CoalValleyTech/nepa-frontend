import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const allowedAdmins = ['batesnate958@gmail.com', 'mnovak03@outlook.com'];

interface School {
  id: number;
  teamName: string;
  schoolName: string;
  mascot?: string;
  division?: string;
  conference?: string;
  homeField?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  name: string;
  location: string;
  sports: string[];
}

interface ScoreEntry {
  homeTeamId: number | '';
  awayTeamId: number | '';
  homeScore: number | '';
  awayScore: number | '';
  date: string;
  notes?: string;
}

interface TeamLocal {
  name: string;
  sport: string;
}

interface Game {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  location: string;
  sport: string;
  notes?: string;
}

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  grade: string;
  height?: string;
  weight?: string;
  sport: string;
}

const PREPOPULATED_SCHOOLS: Partial<School>[] = [
  { teamName: 'Mid Valley', schoolName: 'Mid Valley', division: 'DIV1' },
  { teamName: 'Carbondale', schoolName: 'Carbondale', division: 'DIV1' },
  { teamName: 'Lakeland', schoolName: 'Lakeland', division: 'DIV1' },
  { teamName: 'Holy Cross', schoolName: 'Holy Cross', division: 'DIV1' },
  { teamName: 'Riverside', schoolName: 'Riverside', division: 'DIV1' },
  { teamName: 'Dunmore', schoolName: 'Dunmore', division: 'DIV1' },
  { teamName: 'Old Forge', schoolName: 'Old Forge', division: 'DIV1' },
  { teamName: 'West Scranton', schoolName: 'West Scranton', division: 'DIV2' },
  { teamName: 'Scranton', schoolName: 'Scranton', division: 'DIV2' },
  { teamName: 'Scranton Prep', schoolName: 'Scranton Prep', division: 'DIV2' },
  { teamName: 'Abington', schoolName: 'Abington', division: 'DIV2' },
  { teamName: 'Valley View', schoolName: 'Valley View', division: 'DIV2' },
  { teamName: 'Honesdale', schoolName: 'Honesdale', division: 'DIV2' },
  { teamName: 'Wallenpaupack', schoolName: 'Wallenpaupack', division: 'DIV2' },
  { teamName: 'Western Wayne', schoolName: 'Western Wayne', division: 'DIV2' },
  { teamName: 'Susquehanna', schoolName: 'Susquehanna', division: 'DIV3' },
  { teamName: 'Delaware Valley', schoolName: 'Delaware Valley', division: 'DIV3' },
  { teamName: 'North Pocono', schoolName: 'North Pocono', division: 'DIV3' },
  { teamName: 'Lackawanna Trail', schoolName: 'Lackawanna Trail', division: 'DIV3' },
];

const menuOptions = [
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Schools', value: 'schools' },
  { label: 'Team Management', value: 'team-management' },
  { label: 'Scores', value: 'scores' },
  { label: 'Stats', value: 'stats' },
];

const SPORTS_LIST = [
  'Football',
  'Boys Soccer',
  'Girls Soccer',
  'Boys Cross Country',
  'Girls Cross Country',
  'Golf',
  'Girls Tennis',
  'Girls Volleyball',
  'Boys Basketball',
  'Girls Basketball',
  'Boys Swimming',
  'Girls Swimming',
  'Wrestling',
  'Baseball',
  'Softball',
  'Boys Track',
  'Girls Track',
  'Boys Tennis',
  'Boys Volleyball',
];

// Local state only
interface SchoolLocal {
  name: string;
  location: string;
  sports: string[];
}

function splitSports(sports: string[]) {
  const mens: string[] = [];
  const womens: string[] = [];
  sports.forEach(sport => {
    const s = sport.toLowerCase();
    if (s.startsWith('boys')) mens.push(sport.replace(/^Boys /i, ''));
    else if (s.startsWith('girls')) womens.push(sport.replace(/^Girls /i, ''));
    else if (s === 'football' || s === 'wrestling' || s === 'baseball' || s === 'golf' || s === 'boys volleyball') mens.push(sport);
    else if (s === 'softball' || s === 'girls volleyball' || s === 'girls tennis') womens.push(sport);
    else mens.push(sport); // Default to mens if ambiguous
  });
  return { mens, womens };
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolLocal[]>([]);
  const [form, setForm] = useState<Partial<School>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [scoreForm, setScoreForm] = useState<ScoreEntry>({
    homeTeamId: '',
    awayTeamId: '',
    homeScore: '',
    awayScore: '',
    date: '',
    notes: '',
  });
  const [scoreMessage, setScoreMessage] = useState('');
  const [sports, setSports] = useState<string[]>(['Football']);
  const [newSport, setNewSport] = useState('');
  const [selected, setSelected] = useState('dashboard');
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [schoolForm, setSchoolForm] = useState<SchoolLocal>({
    name: '',
    location: '',
    sports: [],
  });
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [teamForm, setTeamForm] = useState<TeamLocal>({
    name: '',
    sport: '',
  });
  const [teams, setTeams] = useState<TeamLocal[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [showTeamEdit, setShowTeamEdit] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamLocal | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [gameForm, setGameForm] = useState<Omit<Game, 'id'>>({
    date: '',
    time: '',
    homeTeam: '',
    awayTeam: '',
    location: '',
    sport: '',
    notes: '',
  });
  const [playerForm, setPlayerForm] = useState<Omit<Player, 'id'>>({
    name: '',
    number: '',
    position: '',
    grade: '',
    height: '',
    weight: '',
    sport: '',
  });

  // Fetch schools from backend
  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data);
      } else {
        console.error('Failed to fetch schools');
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user || !allowedAdmins.includes(user.email || '')) {
        navigate('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchSchools();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update school
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName || !form.schoolName) {
      setMessage('Team name and school name are required.');
      return;
    }
    setMessage('');
    if (editingId) {
      // Update
      await fetch(`/api/teams/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setMessage('School updated!');
    } else {
      // Add
      await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setMessage('School added!');
    }
    setForm({});
    setEditingId(null);
    fetchSchools();
  };

  // Edit school
  const handleEdit = (school: School) => {
    setForm(school);
    setEditingId(school.id);
    setMessage('');
  };

  // Delete school
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    setMessage('School deleted!');
    fetchSchools();
  };

  // Cancel editing
  const handleCancel = () => {
    setForm({});
    setEditingId(null);
    setMessage('');
  };

  // Sports section handlers
  const handleAddSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSport.trim() || sports.includes(newSport.trim())) return;
    setSports([...sports, newSport.trim()]);
    setNewSport('');
  };

  // Scores & Stats section handlers
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setScoreForm({ ...scoreForm, [e.target.name]: e.target.value });
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreForm.homeTeamId || !scoreForm.awayTeamId || scoreForm.homeTeamId === scoreForm.awayTeamId) {
      setScoreMessage('Please select two different teams.');
      return;
    }
    if (scoreForm.homeScore === '' || scoreForm.awayScore === '' || !scoreForm.date) {
      setScoreMessage('Please enter all required fields.');
      return;
    }
    // TODO: Connect to backend scores API
    setScoreMessage('Score/Stats entry saved! (not yet connected to backend)');
    setScoreForm({ homeTeamId: '', awayTeamId: '', homeScore: '', awayScore: '', date: '', notes: '' });
  };

  const handleSchoolFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchoolForm({ ...schoolForm, [e.target.name]: e.target.value });
  };

  const handleAddSportToSchool = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sport = e.target.value;
    if (sport && !schoolForm.sports.includes(sport)) {
      setSchoolForm({ ...schoolForm, sports: [...schoolForm.sports, sport] });
    }
    e.target.value = '';
  };

  const handleRemoveSportFromSchool = (sport: string) => {
    setSchoolForm({ ...schoolForm, sports: schoolForm.sports.filter(s => s !== sport) });
  };

  const handleSchoolFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolForm),
      });
      
      if (response.ok) {
        const newSchool = await response.json();
        setSchools([...schools, newSchool]);
        setShowAddSchool(false);
        setSchoolForm({ name: '', location: '', sports: [] });
        setMessage('School added successfully!');
      } else {
        setMessage('Failed to add school. Please try again.');
      }
    } catch (error) {
      console.error('Error adding school:', error);
      setMessage('Error adding school. Please try again.');
    }
  };

  // Add Team handlers
  const handleTeamFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTeamForm({ ...teamForm, [e.target.name]: e.target.value });
  };

  const handleTeamFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeams([...teams, teamForm]);
    setShowAddTeam(false);
    setTeamForm({ name: '', sport: '' });
  };

  const handleTeamDropdown = (teamIndex: number) => {
    setOpenDropdown(openDropdown === teamIndex ? null : teamIndex);
  };

  const handleEditTeam = (team: TeamLocal) => {
    setSelectedTeam(team);
    setShowTeamEdit(true);
    setOpenDropdown(null);
  };

  const handleDeleteTeam = (teamIndex: number) => {
    setTeams(teams.filter((_, idx) => idx !== teamIndex));
    setOpenDropdown(null);
  };

  const getPositionsForSport = (sport: string): string[] => {
    const positions: { [key: string]: string[] } = {
      'Football': ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
      'Boys Soccer': ['GK', 'D', 'M', 'F'],
      'Girls Soccer': ['GK', 'D', 'M', 'F'],
      'Boys Basketball': ['PG', 'SG', 'SF', 'PF', 'C'],
      'Girls Basketball': ['PG', 'SG', 'SF', 'PF', 'C'],
      'Baseball': ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'],
      'Softball': ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DP'],
      'Boys Volleyball': ['S', 'OH', 'MB', 'OPP', 'L', 'DS'],
      'Girls Volleyball': ['S', 'OH', 'MB', 'OPP', 'L', 'DS'],
      'Wrestling': ['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285'],
      'Boys Swimming': ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM', 'Relay'],
      'Girls Swimming': ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM', 'Relay'],
      'Boys Track': ['Sprints', 'Distance', 'Hurdles', 'Jumps', 'Throws', 'Relay'],
      'Girls Track': ['Sprints', 'Distance', 'Hurdles', 'Jumps', 'Throws', 'Relay'],
      'Boys Cross Country': ['Runner'],
      'Girls Cross Country': ['Runner'],
      'Golf': ['Player'],
      'Boys Tennis': ['Singles', 'Doubles'],
      'Girls Tennis': ['Singles', 'Doubles'],
    };
    return positions[sport] || ['Player'];
  };

  const handleGameFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setGameForm({ ...gameForm, [e.target.name]: e.target.value });
  };

  const handlePlayerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPlayerForm({ ...playerForm, [e.target.name]: e.target.value });
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    const newGame: Game = {
      ...gameForm,
      id: Date.now().toString(),
    };
    setGames([...games, newGame]);
    setShowAddGame(false);
    setGameForm({
      date: '',
      time: '',
      homeTeam: '',
      awayTeam: '',
      location: '',
      sport: selectedTeam?.sport || '',
      notes: '',
    });
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer: Player = {
      ...playerForm,
      id: Date.now().toString(),
    };
    setPlayers([...players, newPlayer]);
    setShowAddPlayer(false);
    setPlayerForm({
      name: '',
      number: '',
      position: '',
      grade: '',
      height: '',
      weight: '',
      sport: selectedTeam?.sport || '',
    });
  };

  // Group teams by sport
  const teamsBySport: { [sport: string]: TeamLocal[] } = {};
  teams.forEach((team) => {
    if (!teamsBySport[team.sport]) teamsBySport[team.sport] = [];
    teamsBySport[team.sport].push(team);
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Menu */}
      <aside className="w-64 bg-primary-500 text-cream-100 flex flex-col py-8 px-4 space-y-0">
        <h2 className="text-2xl font-bold mb-8 text-center">Admin</h2>
        {menuOptions.map((option, idx) => (
          <>
            <button
              key={option.value}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-semibold text-lg ${selected === option.value ? 'bg-primary-600' : 'hover:bg-primary-600'}`}
              onClick={() => setSelected(option.value)}
            >
              {option.label}
            </button>
            {idx < menuOptions.length - 1 && (
              <div className="w-full h-px bg-cream-200 my-1 opacity-40"></div>
            )}
          </>
        ))}
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 bg-cream-50 p-8">
        {selected === 'schools' && (
          <div>
            <button
              className="px-6 py-3 mb-6 rounded-lg bg-secondary-500 text-cream-100 hover:bg-secondary-600 transition-colors font-semibold text-lg"
              onClick={() => setShowAddSchool(true)}
            >
              + Add School
            </button>
            {/* Schools Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Name</th>
                    <th className="px-4 py-2 border">Location</th>
                    <th className="px-4 py-2 border">Mens Sports</th>
                    <th className="px-4 py-2 border">Womans Sports</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school, idx) => {
                    const { mens, womens } = splitSports(school.sports);
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-2 border font-semibold text-primary-600">{school.name}</td>
                        <td className="px-4 py-2 border">{school.location}</td>
                        <td className="px-4 py-2 border">
                          {mens.length > 0 ? mens.join(', ') : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-2 border">
                          {womens.length > 0 ? womens.join(', ') : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selected === 'team-management' && (
          <div>
            <button
              className="px-6 py-3 mb-6 rounded-lg bg-secondary-500 text-cream-100 hover:bg-secondary-600 transition-colors font-semibold text-lg"
              onClick={() => setShowAddTeam(true)}
            >
              + Add Team
            </button>
            {/* Teams grouped by sport */}
            <div className="space-y-8">
              {SPORTS_LIST.map((sport) => (
                <div key={sport}>
                  <h3 className="text-xl font-bold text-primary-600 mb-2">{sport}</h3>
                  <div className="flex flex-wrap gap-3">
                    {teamsBySport[sport]?.length ? (
                      teamsBySport[sport].map((team, idx) => {
                        const teamIndex = teams.findIndex(t => t.name === team.name && t.sport === team.sport);
                        return (
                          <div key={idx} className="bg-white rounded-lg shadow p-4 border border-primary-200 min-w-[180px] relative">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-primary-700">{team.name}</span>
                              <button
                                onClick={() => handleTeamDropdown(teamIndex)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                                aria-label="Team options"
                              >
                                ⋯
                              </button>
                            </div>
                            {openDropdown === teamIndex && (
                              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                <button
                                  onClick={() => handleEditTeam(team)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                  Edit Team
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(teamIndex)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                                >
                                  Delete Team
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-gray-400">No teams added for {sport}.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selected === 'scores' && (
          <div>
            {/* Scores section content */}
          </div>
        )}
        {selected === 'stats' && (
          <div>
            {/* Stats section content */}
          </div>
        )}
        {/* Modal for Add School */}
        {showAddSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowAddSchool(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-primary-600">Add School</h2>
              <form onSubmit={handleSchoolFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">School Name</label>
                  <input
                    type="text"
                    name="name"
                    value={schoolForm.name}
                    onChange={handleSchoolFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={schoolForm.location}
                    onChange={handleSchoolFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Sports</label>
                  <select
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 mb-2"
                    onChange={handleAddSportToSchool}
                    value=""
                  >
                    <option value="">Select a sport...</option>
                    {SPORTS_LIST.filter(sport => !schoolForm.sports.includes(sport)).map((sport) => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {schoolForm.sports.map((sport) => (
                      <span key={sport} className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        {sport}
                        <button
                          type="button"
                          className="ml-2 text-secondary-500 hover:text-secondary-700 font-bold"
                          onClick={() => handleRemoveSportFromSchool(sport)}
                          aria-label={`Remove ${sport}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal for Add Team */}
        {showAddTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowAddTeam(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-primary-600">Add Team</h2>
              <form onSubmit={handleTeamFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Team Name</label>
                  <input
                    type="text"
                    name="name"
                    value={teamForm.name}
                    onChange={handleTeamFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Sport</label>
                  <select
                    name="sport"
                    value={teamForm.sport}
                    onChange={handleTeamFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  >
                    <option value="">Select a sport...</option>
                    {SPORTS_LIST.map((sport) => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-lg"
                  >
                    Save Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal for Edit Team */}
        {showTeamEdit && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowTeamEdit(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-primary-600">Edit Team: {selectedTeam.name}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedules Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary-600 border-b border-primary-200 pb-2">Schedules</h3>
                  <div className="space-y-4">
                    {games.filter(game => game.sport === selectedTeam.sport).length > 0 ? (
                      games.filter(game => game.sport === selectedTeam.sport).map((game) => (
                        <div key={game.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-primary-700">
                              {game.homeTeam} vs {game.awayTeam}
                            </div>
                            <button className="text-red-500 hover:text-red-700 text-sm">×</button>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>{game.date} at {game.time}</div>
                            <div>{game.location}</div>
                            {game.notes && <div className="mt-1 italic">{game.notes}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600 mb-4">No games scheduled yet.</p>
                      </div>
                    )}
                    <button 
                      onClick={() => setShowAddGame(true)}
                      className="w-full px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600 transition-colors"
                    >
                      + Add Game
                    </button>
                  </div>
                </div>

                {/* Rosters Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary-600 border-b border-primary-200 pb-2">Rosters</h3>
                  <div className="space-y-4">
                    {players.filter(player => player.sport === selectedTeam.sport).length > 0 ? (
                      players.filter(player => player.sport === selectedTeam.sport).map((player) => (
                        <div key={player.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-primary-700">
                              #{player.number} {player.name}
                            </div>
                            <button className="text-red-500 hover:text-red-700 text-sm">×</button>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>{player.position} • Grade {player.grade}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600 mb-4">No players on roster yet.</p>
                      </div>
                    )}
                    <button 
                      onClick={() => setShowAddPlayer(true)}
                      className="w-full px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600 transition-colors"
                    >
                      + Add Player
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTeamEdit(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal for Add Game */}
        {showAddGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowAddGame(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-primary-600">Add Game</h2>
              
              <form onSubmit={handleAddGame} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={gameForm.date}
                      onChange={handleGameFormChange}
                      className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={gameForm.time}
                      onChange={handleGameFormChange}
                      className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Home Team</label>
                    <input
                      type="text"
                      name="homeTeam"
                      value={gameForm.homeTeam}
                      onChange={handleGameFormChange}
                      className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="Home team name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-primary-700 font-semibold mb-1">Away Team</label>
                    <input
                      type="text"
                      name="awayTeam"
                      value={gameForm.awayTeam}
                      onChange={handleGameFormChange}
                      className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="Away team name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={gameForm.location}
                    onChange={handleGameFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Stadium, field, or venue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Sport</label>
                  <input
                    type="text"
                    name="sport"
                    value={gameForm.sport}
                    className="w-full border border-primary-300 rounded px-4 py-2 bg-gray-100"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={gameForm.notes}
                    onChange={handleGameFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Additional information about the game"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddGame(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                  >
                    Add Game
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal for Add Player */}
        {showAddPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowAddPlayer(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-primary-600">Add Player</h2>
              
              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={playerForm.name}
                    onChange={handlePlayerFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Number</label>
                  <input
                    type="text"
                    name="number"
                    value={playerForm.number}
                    onChange={handlePlayerFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Position</label>
                  <select
                    name="position"
                    value={playerForm.position}
                    onChange={handlePlayerFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  >
                    <option value="">Select position...</option>
                    {getPositionsForSport(playerForm.sport).map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Grade</label>
                  <select
                    name="grade"
                    value={playerForm.grade}
                    onChange={handlePlayerFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                    required
                  >
                    <option value="">Select grade...</option>
                    <option value="9">9th Grade (Freshman)</option>
                    <option value="10">10th Grade (Sophomore)</option>
                    <option value="11">11th Grade (Junior)</option>
                    <option value="12">12th Grade (Senior)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Height</label>
                  <input
                    type="text"
                    name="height"
                    value={playerForm.height}
                    onChange={handlePlayerFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={playerForm.weight}
                    onChange={handlePlayerFormChange}
                    className="w-full border border-primary-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-primary-700 font-semibold mb-1">Sport</label>
                  <input
                    type="text"
                    name="sport"
                    value={playerForm.sport}
                    className="w-full border border-primary-300 rounded px-4 py-2 bg-gray-100"
                    readOnly
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                  >
                    Add Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin; 