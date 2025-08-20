import React, { useState, useEffect } from 'react';
import { School, addRosterToSchool, getRosterForSchool, updateRosterForSchool } from '../services/firebaseService';

interface AdminAddRosterProps {
  schools: School[];
}

interface Player {
  number: string;
  name: string;
  position: string;
  defensivePosition?: string; // New field for defensive position
  grade: string;
  stats?: {
    [key: string]: string | number;
  };
}

interface RosterData {
  sport: string;
  season: string;
  players: Player[];
}

const SPORTS = [
  { 
    value: 'football', 
    label: 'Football (Boys)', 
    positions: ['QB', 'RB', 'WR', 'TE', 'OL', 'K', 'P'],
    defensivePositions: ['DL', 'LB', 'CB', 'S', 'DB'],
    supportsDualPositions: true,
    requiresPosition: true
  },
  { value: 'soccer-boys', label: 'Soccer (Boys)', positions: ['GK', 'D', 'M', 'F'], supportsDualPositions: false, requiresPosition: true },
  { value: 'soccer-girls', label: 'Soccer (Girls)', positions: ['GK', 'D', 'M', 'F'], supportsDualPositions: false, requiresPosition: true },
  { value: 'volleyball', label: 'Girls Volleyball', positions: ['S', 'OH', 'MB', 'RS', 'L', 'DS'], supportsDualPositions: false, requiresPosition: true },
  { value: 'tennis', label: 'Girls Tennis', positions: ['1 Singles', '2 Singles', '3 Singles', '1 Doubles', '2 Doubles', '3 Doubles'], supportsDualPositions: false, requiresPosition: true },
  { value: 'cross-country-boys', label: 'Cross Country (Boys)', positions: ['Runner'], supportsDualPositions: false, requiresPosition: false },
  { value: 'cross-country-girls', label: 'Cross Country (Girls)', positions: ['Runner'], supportsDualPositions: false, requiresPosition: false },
  { value: 'field-hockey', label: 'Field Hockey (Girls)', positions: ['GK', 'D', 'M', 'F'], supportsDualPositions: false, requiresPosition: true },
  { value: 'golf-boys', label: 'Golf (Boys)', positions: ['Player'], supportsDualPositions: false, requiresPosition: false },
  { value: 'golf-girls', label: 'Golf (Girls)', positions: ['Player'], supportsDualPositions: false, requiresPosition: false },
];

const GRADES = ['9', '10', '11', '12'];

const AdminAddRoster: React.FC<AdminAddRosterProps> = ({ schools }) => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [season, setSeason] = useState('');
  const [players, setPlayers] = useState<Player[]>([
    { number: '', name: '', position: '', grade: '' }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingRosters, setExistingRosters] = useState<any>({});

  const selectedSchoolData = schools.find(s => s.id === selectedSchool);
  const selectedSportData = SPORTS.find(s => s.value === selectedSport);

  useEffect(() => {
    const loadRosters = async () => {
      if (selectedSchool && selectedSport) {
        try {
          const rosters = await getRosterForSchool(selectedSchool, selectedSport);
          setExistingRosters(rosters);
        } catch (error: any) {
          console.error('Error loading existing rosters:', error);
          setExistingRosters({});
        }
      }
    };

    loadRosters();
  }, [selectedSchool, selectedSport]);

  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const addPlayer = () => {
    setPlayers([...players, { number: '', name: '', position: '', grade: '' }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
    setError(''); // Clear any validation errors
    setMessage('Player deleted successfully'); // Show success message
    // Clear the success message after 2 seconds
    setTimeout(() => setMessage(''), 2000);
  };

  // Ensure there's always at least one player slot
  useEffect(() => {
    if (players.length === 0) {
      setPlayers([{ number: '', name: '', position: '', grade: '' }]);
    }
  }, [players.length]);

  const handleEditRoster = async (season: string) => {
    if (!existingRosters[season]) return;
    
    setSeason(season);
    setPlayers(existingRosters[season].players || [{ number: '', name: '', position: '', grade: '' }]);
    setIsEditing(true);
    setMessage('');
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSeason('');
    setPlayers([{ number: '', name: '', position: '', grade: '' }]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedSchool || !selectedSport || !season) {
      setError('Please select a school, sport, and season.');
      return;
    }

    // Only include players that have all required fields filled in
    const playersWithData = players.filter(player => {
      const hasRequiredFields = player.number && player.name && player.grade;
      const hasPosition = selectedSportData?.requiresPosition ? player.position : true;
      return hasRequiredFields && hasPosition;
    });

    // Allow empty roster (no players) - don't require at least one player
    // When editing, allow empty roster to be saved
    if (playersWithData.length === 0) {
      // Create an empty roster
      const rosterData: RosterData = {
        sport: selectedSport,
        season,
        players: []
      };
      
      if (isEditing) {
        await updateRosterForSchool(selectedSchool, selectedSport, season, rosterData);
        setMessage(`Roster updated successfully for ${selectedSchoolData?.name} ${selectedSportData?.label} ${season} season!`);
      } else {
        await addRosterToSchool(selectedSchool, rosterData);
        setMessage(`Roster added successfully for ${selectedSchoolData?.name} ${selectedSportData?.label} ${season} season!`);
      }
      
      // Reset form
      setSelectedSchool('');
      setSelectedSport('');
      setSeason('');
      setPlayers([{ number: '', name: '', position: '', grade: '' }]);
      setIsEditing(false);
      setExistingRosters({});
      return;
    }

    setIsSubmitting(true);
    try {
      const rosterData: RosterData = {
        sport: selectedSport,
        season,
        players: playersWithData
      };

      if (isEditing) {
        await updateRosterForSchool(selectedSchool, selectedSport, season, rosterData);
        setMessage(`Roster updated successfully for ${selectedSchoolData?.name} ${selectedSportData?.label} ${season} season!`);
      } else {
        await addRosterToSchool(selectedSchool, rosterData);
        setMessage(`Roster added successfully for ${selectedSchoolData?.name} ${selectedSportData?.label} ${season} season!`);
      }
      
      // Reset form
      setSelectedSchool('');
      setSelectedSport('');
      setSeason('');
      setPlayers([{ number: '', name: '', position: '', grade: '' }]);
      setIsEditing(false);
      setExistingRosters({});
    } catch (err: any) {
      setError(err.message || 'Failed to add roster.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mb-10 space-y-6">
        <h2 className="text-2xl font-semibold text-primary-600 mb-4">{isEditing ? 'Edit Team Roster' : 'Add Team Roster'}</h2>
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">School *</label>
            <select
              value={selectedSchool}
              onChange={e => {
                setSelectedSchool(e.target.value);
                setSelectedSport('');
              }}
              className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              required
              disabled={isSubmitting}
            >
              <option value="">Select a school</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Sport *</label>
            <select
              value={selectedSport}
              onChange={e => setSelectedSport(e.target.value)}
              className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              required
              disabled={!selectedSchool || isSubmitting}
            >
              <option value="">Select a sport</option>
              {SPORTS.map(sport => (
                <option key={sport.value} value={sport.value}>{sport.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Season *</label>
            <select
              value={season}
              onChange={e => setSeason(e.target.value)}
              className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              required
              disabled={isSubmitting}
            >
              <option value="">Select season</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
          </div>
        </div>

        {/* Existing Rosters Section */}
        {selectedSchool && selectedSport && Object.keys(existingRosters).length > 0 && !isEditing && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-primary-700 mb-4">Existing Rosters</h3>
            <div className="space-y-3">
              {Object.entries(existingRosters).map(([season, rosterData]: [string, any]) => (
                <div key={season} className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-primary-800">{season} Season</h4>
                      <p className="text-sm text-primary-600">{rosterData.players?.length || 0} players</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEditRoster(season)}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit Roster
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Section */}
        {selectedSport && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary-700">Players</h3>
              <button
                type="button"
                onClick={addPlayer}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={isSubmitting}
              >
                + Add Player
              </button>
            </div>
            
            <div className="space-y-4">
              {players.map((player, index) => (
                <div key={index} className="bg-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-primary-700">Player {index + 1}</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          removePlayer(index);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                        disabled={isSubmitting}
                      >
                        Delete Player
                      </button>
                    </div>
                  </div>
                  
                  <div className={`grid gap-4 ${
                    selectedSportData?.supportsDualPositions ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' : 
                    selectedSportData?.requiresPosition ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">Number</label>
                      <input
                        type="text"
                        value={player.number}
                        onChange={e => handlePlayerChange(index, 'number', e.target.value)}
                        placeholder="e.g., 12"
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={player.name}
                        onChange={e => handlePlayerChange(index, 'name', e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {selectedSportData?.requiresPosition && (
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">
                          {selectedSportData?.supportsDualPositions ? 'Offensive Position' : 'Position'}
                          {!selectedSportData?.requiresPosition && <span className="text-gray-500 text-xs"> (Optional)</span>}
                        </label>
                        <select
                          value={player.position}
                          onChange={e => handlePlayerChange(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                          disabled={isSubmitting}
                        >
                          <option value="">Select position</option>
                          {selectedSportData?.positions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {selectedSportData?.supportsDualPositions && (
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">
                          Defensive Position <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <select
                          value={player.defensivePosition || ''}
                          onChange={e => handlePlayerChange(index, 'defensivePosition', e.target.value)}
                          className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                          disabled={isSubmitting}
                        >
                          <option value="">No defensive position</option>
                          {selectedSportData?.defensivePositions?.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">Grade</label>
                      <select
                        value={player.grade}
                        onChange={e => handlePlayerChange(index, 'grade', e.target.value)}
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                        disabled={isSubmitting}
                      >
                        <option value="">Select grade</option>
                        {GRADES.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Position Display for Football */}
                  {selectedSportData?.supportsDualPositions && player.position && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200">
                      <div className="text-sm text-primary-600">
                        <span className="font-semibold">Position Summary:</span>
                        <div className="mt-1">
                          <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs mr-2">
                            Offense: {player.position}
                          </span>
                          {player.defensivePosition && (
                            <span className="inline-block bg-secondary-100 text-secondary-800 px-2 py-1 rounded text-xs">
                              Defense: {player.defensivePosition}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Position Display for Other Sports */}
                  {selectedSportData?.requiresPosition && !selectedSportData?.supportsDualPositions && player.position && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-primary-200">
                      <div className="text-sm text-primary-600">
                        <span className="font-semibold">Position:</span>
                        <div className="mt-1">
                          <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                            {player.position}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-center font-bold">{error}</div>}
        {message && <div className="text-green-600 text-center font-bold">{message}</div>}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isSubmitting ? (isEditing ? 'Updating Roster...' : 'Saving Roster...') : (isEditing ? 'Update Roster' : 'Save Roster')}
        </button>
        
        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
};

export default AdminAddRoster; 