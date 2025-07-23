import { useState, useEffect, useRef } from 'react';
import { getGlobalSchedules, addScheduleToGlobal, updateSchoolScheduleEntry, updateScoreForBothSchools } from '../services/firebaseService';
import { db } from '../firebase';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface AdminAddGameProps {
  schools: any[];
}

const SPORTS = [
  { value: 'football', label: 'Football' },
  { value: 'tennis', label: 'Tennis' },
];

const AdminAddGame: React.FC<AdminAddGameProps> = ({ schools }) => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [scoreInputs, setScoreInputs] = useState<any>({});
  const [externalTeams, setExternalTeams] = useState<any[]>([]);
  const [showAddTeam, setShowAddTeam] = useState<'home' | 'away' | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);

  // Default sport icons
  const sportIcons: Record<string, string> = {
    football: '/default-football-helmet.png',
    tennis: '/default-tennis-racket.png',
  };

  useEffect(() => {
    fetchLiveGames();
  }, []);

  const fetchLiveGames = async () => {
    setLoadingGames(true);
    try {
      const allGames = await getGlobalSchedules();
      setLiveGames(allGames.filter((g: any) => g.status && g.status.toUpperCase() === 'LIVE'));
      setUpcomingGames(allGames.filter((g: any) => g.status && g.status.toUpperCase() === 'UPCOMING'));
    } catch {
      setLiveGames([]);
      setUpcomingGames([]);
    } finally {
      setLoadingGames(false);
    }
  };

  // Helper to get scoreboard columns by sport
  function getScoreboardColumns(sport: string) {
    if (sport === 'football') return ['1', '2', '3', '4', 'OT'];
    if (sport === 'soccer') return ['1', '2', 'OT1', 'OT2', 'SO'];
    // Default: 2 periods
    return ['1', '2'];
  }

  // Handle score input change
  const handleScoreInput = (team: 'home' | 'away', col: string, value: string) => {
    setScoreInputs((prev: any) => ({
      ...prev,
      [team]: {
        ...prev[team],
        [col]: value,
      },
    }));
  };

  // Save score to Firestore
  const handleSaveScore = async () => {
    if (!editingGameId) return;
    const gameRef = doc(db, 'schedules', editingGameId);
    await updateDoc(gameRef, {
      score: scoreInputs,
    });
    setEditingGameId(null);
    setScoreInputs({});
    fetchLiveGames();
  };

  // Submit game as final
  const handleSubmitGame = async (game: any) => {
    if (!editingGameId) return;
    const gameRef = doc(db, 'schedules', editingGameId);
    await updateDoc(gameRef, {
      score: scoreInputs,
      status: 'FINAL',
    });
    // Also update the school's schedule
    if (game.schoolId && game.sport) {
      const homeSchool = schools.find(s => s.id === game.schoolId);
      const awaySchool = schools.find(s => s.name === game.opponent);
      if (homeSchool && awaySchool) {
        await updateScoreForBothSchools(
          homeSchool.id,
          awaySchool.id,
          game.sport,
          game.location,
          game.time,
          homeSchool.name,
          awaySchool.name,
          scoreInputs,
          'FINAL'
        );
      } else {
        // fallback: update just the home school
        const oldEntry = {
          location: game.location,
          time: game.time,
          opponent: game.opponent,
          status: game.status,
        };
        const updatedEntry = {
          location: game.location,
          time: game.time,
          opponent: game.opponent,
          status: 'FINAL',
          score: scoreInputs,
        };
        await updateSchoolScheduleEntry(game.schoolId, game.sport, oldEntry, updatedEntry);
      }
    }
    setEditingGameId(null);
    setScoreInputs({});
    fetchLiveGames();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!homeTeam || !awayTeam || !sport || !location || !time) {
      setError('Please fill out all fields.');
      return;
    }
    if (homeTeam === awayTeam) {
      setError('Home and away teams must be different.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Find school info for home team
      const homeSchool = schools.find(s => s.id === homeTeam);
      await addScheduleToGlobal(
        homeSchool?.id,
        homeSchool?.name,
        sport,
        {
          location,
          time,
          opponent: schools.find(s => s.id === awayTeam)?.name || '',
          status: 'LIVE',
          url,
        }
      );
      setMessage('Live game added!');
      setHomeTeam('');
      setAwayTeam('');
      setSport('');
      setLocation('');
      setTime('');
      setUrl('');
      fetchLiveGames();
    } catch (err: any) {
      setError(err.message || 'Failed to add game.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new external team
  const handleAddExternalTeam = (teamType: 'home' | 'away') => {
    if (!newTeamName) return;
    setExternalTeams(prev => [
      ...prev,
      {
        name: newTeamName,
        logoUrl: newTeamLogo ? URL.createObjectURL(newTeamLogo) : sportIcons[sport] || '',
        sport,
      },
    ]);
    if (teamType === 'home') setHomeTeam(newTeamName);
    if (teamType === 'away') setAwayTeam(newTeamName);
    setShowAddTeam(null);
    setNewTeamName('');
    setNewTeamLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Delete a game
  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    await deleteDoc(doc(db, 'schedules', gameId));
    fetchLiveGames();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-primary-700 mb-6">Add Live Game</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Home Team</label>
            <select
              value={homeTeam}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowAddTeam('home');
                } else {
                  setHomeTeam(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select home team</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {externalTeams.filter(team => team.sport === sport).map((team, i) => (
                <option key={team.name + i} value={team.name}>{team.name} (External)</option>
              ))}
              <option value="__add_new__">+ Add New Team</option>
            </select>
            {showAddTeam === 'home' && (
              <div className="bg-white border border-primary-200 rounded-lg p-4 mt-2 shadow-lg z-50">
                <div className="mb-2 font-semibold text-primary-700">Add New Home Team</div>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-primary-200 rounded-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setNewTeamLogo(e.target.files?.[0] || null)}
                  className="w-full mb-2"
                />
                <button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1 rounded mr-2"
                  onClick={() => handleAddExternalTeam('home')}
                >
                  Add Team
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-1 rounded"
                  onClick={() => setShowAddTeam(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Away Team</label>
            <select
              value={awayTeam}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowAddTeam('away');
                } else {
                  setAwayTeam(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select away team</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {externalTeams.filter(team => team.sport === sport).map((team, i) => (
                <option key={team.name + i} value={team.name}>{team.name} (External)</option>
              ))}
              <option value="__add_new__">+ Add New Team</option>
            </select>
            {showAddTeam === 'away' && (
              <div className="bg-white border border-primary-200 rounded-lg p-4 mt-2 shadow-lg z-50">
                <div className="mb-2 font-semibold text-primary-700">Add New Away Team</div>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-primary-200 rounded-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setNewTeamLogo(e.target.files?.[0] || null)}
                  className="w-full mb-2"
                />
                <button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1 rounded mr-2"
                  onClick={() => handleAddExternalTeam('away')}
                >
                  Add Team
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-1 rounded"
                  onClick={() => setShowAddTeam(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Sport</label>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select sport</option>
              {SPORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Time</label>
          <input
            type="datetime-local"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Game URL (optional)</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg"
            placeholder="https://example.com/stream"
            disabled={isSubmitting}
          />
        </div>
        {error && <div className="text-red-600 text-center font-bold">{error}</div>}
        {message && <div className="text-green-600 text-center font-bold">{message}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Live Game'}
        </button>
      </form>
      <h2 className="text-2xl font-bold text-primary-700 mb-6 mt-12">Add Upcoming Game</h2>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!homeTeam || !awayTeam || !sport || !location || !time) {
          setError('Please fill out all fields.');
          return;
        }
        if (homeTeam === awayTeam) {
          setError('Home and away teams must be different.');
          return;
        }
        setIsSubmitting(true);
        try {
          const homeSchool = schools.find(s => s.id === homeTeam);
          await addScheduleToGlobal(
            homeSchool?.id,
            homeSchool?.name,
            sport,
            {
              location,
              time,
              opponent: schools.find(s => s.id === awayTeam)?.name || '',
              status: 'UPCOMING',
              url,
            }
          );
          setMessage('Upcoming game added!');
          setHomeTeam('');
          setAwayTeam('');
          setSport('');
          setLocation('');
          setTime('');
          setUrl('');
          fetchLiveGames();
        } catch (err: any) {
          setError(err.message || 'Failed to add game.');
        } finally {
          setIsSubmitting(false);
        }
      }} className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Home Team</label>
            <select
              value={homeTeam}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowAddTeam('home');
                } else {
                  setHomeTeam(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select home team</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {externalTeams.filter(team => team.sport === sport).map((team, i) => (
                <option key={team.name + i} value={team.name}>{team.name} (External)</option>
              ))}
              <option value="__add_new__">+ Add New Team</option>
            </select>
            {showAddTeam === 'home' && (
              <div className="bg-white border border-primary-200 rounded-lg p-4 mt-2 shadow-lg z-50">
                <div className="mb-2 font-semibold text-primary-700">Add New Home Team</div>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-primary-200 rounded-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setNewTeamLogo(e.target.files?.[0] || null)}
                  className="w-full mb-2"
                />
                <button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1 rounded mr-2"
                  onClick={() => handleAddExternalTeam('home')}
                >
                  Add Team
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-1 rounded"
                  onClick={() => setShowAddTeam(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Away Team</label>
            <select
              value={awayTeam}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowAddTeam('away');
                } else {
                  setAwayTeam(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select away team</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
              {externalTeams.filter(team => team.sport === sport).map((team, i) => (
                <option key={team.name + i} value={team.name}>{team.name} (External)</option>
              ))}
              <option value="__add_new__">+ Add New Team</option>
            </select>
            {showAddTeam === 'away' && (
              <div className="bg-white border border-primary-200 rounded-lg p-4 mt-2 shadow-lg z-50">
                <div className="mb-2 font-semibold text-primary-700">Add New Away Team</div>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-primary-200 rounded-lg"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={e => setNewTeamLogo(e.target.files?.[0] || null)}
                  className="w-full mb-2"
                />
                <button
                  type="button"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1 rounded mr-2"
                  onClick={() => handleAddExternalTeam('away')}
                >
                  Add Team
                </button>
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-1 rounded"
                  onClick={() => setShowAddTeam(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Sport</label>
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            >
              <option value="">Select sport</option>
              {SPORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Time</label>
          <input
            type="datetime-local"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Game URL (optional)</label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg"
            placeholder="https://example.com/stream"
            disabled={isSubmitting}
          />
        </div>
        {error && <div className="text-red-600 text-center font-bold">{error}</div>}
        {message && <div className="text-green-600 text-center font-bold">{message}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Upcoming Game'}
        </button>
      </form>
      <h3 className="text-xl font-semibold text-primary-700 mb-4">Live Games</h3>
      {loadingGames ? (
        <div className="text-center py-4">Loading...</div>
      ) : liveGames.length === 0 ? (
        <div className="text-primary-400 text-center">No live games.</div>
      ) : (
        <div className="space-y-4">
          {liveGames.map((game, idx) => {
            const home = schools.find(s => s.id === game.schoolId);
            const away = schools.find(s => s.name === game.opponent);
            const columns = getScoreboardColumns(game.sport);
            const score = game.score || {};
            return (
              <div key={idx} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col items-stretch">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                  <div className="text-primary-700 font-medium">{game.sport && game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}</div>
                  <div className="text-gray-600 text-sm mt-1 sm:mt-0">{game.location}</div>
                  <div className="text-primary-500 text-sm mt-1 sm:mt-0">{game.time && new Date(game.time).toLocaleString()}</div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-b">
                  <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600">
                    {home && home.logoUrl && (
                      <img src={home.logoUrl} alt={home.name + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                    )}
                    <span className="truncate max-w-[90px]">{home?.name}</span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center mx-2">
                    <span className="text-xs text-primary-400">VS</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600 justify-end">
                    {away && away.logoUrl && (
                      <img src={away.logoUrl} alt={away.name + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                    )}
                    <span className="truncate max-w-[90px] text-right">{away?.name}</span>
                  </div>
                </div>
                {/* Scoreboard or Edit button */}
                {editingGameId === game.id ? (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-primary-200">
                    <div className="flex items-center mb-2">
                      <div className="w-24"></div>
                      <div className="w-12 text-center font-bold text-green-700">Final</div>
                      {columns.map(col => (
                        <div key={col} className="w-12 text-center font-bold text-gray-700">{col}</div>
                      ))}
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-24 text-right font-semibold text-primary-700">{home?.name}</div>
                      <input className="w-12 text-center border rounded bg-green-50" value={scoreInputs.home?.final || ''} onChange={e => handleScoreInput('home', 'final', e.target.value)} />
                      {columns.map(col => (
                        <input key={col} className="w-12 text-center border rounded" value={scoreInputs.home?.[col] || ''} onChange={e => handleScoreInput('home', col, e.target.value)} />
                      ))}
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-24 text-right font-semibold text-primary-700">{away?.name}</div>
                      <input className="w-12 text-center border rounded bg-green-50" value={scoreInputs.away?.final || ''} onChange={e => handleScoreInput('away', 'final', e.target.value)} />
                      {columns.map(col => (
                        <input key={col} className="w-12 text-center border rounded" value={scoreInputs.away?.[col] || ''} onChange={e => handleScoreInput('away', col, e.target.value)} />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button className="bg-green-600 text-white px-4 py-1 rounded" onClick={() => handleSaveScore()}>Save</button>
                      <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={() => handleSubmitGame(game)}>Submit Game</button>
                      <button className="bg-gray-200 text-gray-700 px-4 py-1 rounded" onClick={() => setEditingGameId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-4">
                    {/* Display score if set */}
                    {score.home || score.away ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-700">{home?.name}</span>
                          <span className="bg-green-100 px-2 py-1 rounded font-bold">{score.home?.final || '-'}</span>
                          {columns.map(col => (
                            <span key={col} className="bg-gray-100 px-2 py-1 rounded font-mono">{score.home?.[col] || '-'}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-700">{away?.name}</span>
                          <span className="bg-green-100 px-2 py-1 rounded font-bold">{score.away?.final || '-'}</span>
                          {columns.map(col => (
                            <span key={col} className="bg-gray-100 px-2 py-1 rounded font-mono">{score.away?.[col] || '-'}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-primary-400">No score set.</span>
                    )}
                    <button className="ml-auto bg-primary-500 hover:bg-primary-600 text-white px-4 py-1 rounded" onClick={() => { setEditingGameId(game.id); setScoreInputs(score || {}); }}>Edit</button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded" onClick={() => handleDeleteGame(game.id)}>Delete Game</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <h3 className="text-xl font-semibold text-primary-700 mb-4">Upcoming Games</h3>
      {loadingGames ? (
        <div className="text-center py-4">Loading...</div>
      ) : upcomingGames.length === 0 ? (
        <div className="text-primary-400 text-center">No upcoming games.</div>
      ) : (
        <div className="space-y-4">
          {upcomingGames.map((game, idx) => {
            const home = schools.find(s => s.id === game.schoolId);
            const away = schools.find(s => s.name === game.opponent);
            return (
              <div key={idx} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col items-stretch">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                  <div className="text-primary-700 font-medium">{game.sport && game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}</div>
                  <div className="text-gray-600 text-sm mt-1 sm:mt-0">{game.location}</div>
                  <div className="text-primary-500 text-sm mt-1 sm:mt-0">{game.time && new Date(game.time).toLocaleString()}</div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-b">
                  <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600">
                    {home && home.logoUrl && (
                      <img src={home.logoUrl} alt={home.name + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                    )}
                    <span className="truncate max-w-[90px]">{home?.name}</span>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center mx-2">
                    <span className="text-xs text-primary-400">VS</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 text-lg font-bold text-primary-600 justify-end">
                    {away && away.logoUrl && (
                      <img src={away.logoUrl} alt={away.name + ' logo'} className="h-8 w-8 object-contain rounded bg-white border border-primary-200" />
                    )}
                    <span className="truncate max-w-[90px] text-right">{away?.name}</span>
                  </div>
                </div>
                {game.url && (
                  <div className="mt-2 text-blue-600 underline"><a href={game.url} target="_blank" rel="noopener noreferrer">Game Link</a></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAddGame; 