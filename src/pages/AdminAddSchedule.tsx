import React, { useState } from 'react';
import { School, addScheduleToSchool, deleteScheduleEntry } from '../services/firebaseService';
import { useEffect } from 'react';
import { useRef } from 'react';

interface AdminAddScheduleProps {
  schools: School[];
  reloadSchools?: () => void;
}

interface ScheduleEntry {
  location: string;
  time: string;
  opponent: string;
}

const AdminAddSchedule: React.FC<AdminAddScheduleProps> = ({ schools, reloadSchools = undefined }) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [entries, setEntries] = useState<ScheduleEntry[]>([
    { location: '', time: '', opponent: '' }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSchedules, setExistingSchedules] = useState<ScheduleEntry[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [externalTeams, setExternalTeams] = useState<any[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default sport icons
  const sportIcons: Record<string, string> = {
    football: '/default-football-helmet.png',
    tennis: '/default-tennis-racket.png',
    'cross-country-boys': '/default-running.png',
    'cross-country-girls': '/default-running.png',
    'field-hockey': '/default-field-hockey.png',
    'golf-boys': '/default-golf.png',
    'golf-girls': '/default-golf.png',
    'soccer-boys': '/default-soccer.png',
    'soccer-girls': '/default-soccer.png',
    volleyball: '/default-volleyball.png',
  };

  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  const availableSports = selectedSchool?.sports || [];

  // Fetch existing schedules for selected school/sport
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedSchoolId || !selectedSport) {
        setExistingSchedules([]);
        return;
      }
      setLoadingSchedules(true);
      try {
        const school = schools.find(s => s.id === selectedSchoolId);
        const schedules = (school && (school as any).schedules && typeof (school as any).schedules === 'object') ? (school as any).schedules : {};
        const sportSchedules = Array.isArray(schedules[selectedSport]) ? schedules[selectedSport] : [];
        setExistingSchedules(sportSchedules);
      } catch (err) {
        setExistingSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, [selectedSchoolId, selectedSport, schools]);

  // Delete a schedule entry
  const handleDeleteSchedule = async (entry: ScheduleEntry) => {
    if (!selectedSchoolId || !selectedSport) return;
    setIsSubmitting(true);
    setError('');
    setMessage('');
    try {
      await deleteScheduleEntry(selectedSchoolId, selectedSport, entry);
      setMessage('Schedule deleted successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete schedule.');
    } finally {
      setIsSubmitting(false);
      if (typeof reloadSchools === 'function') reloadSchools();
    }
  };

  const handleEntryChange = (idx: number, field: keyof ScheduleEntry, value: string) => {
    setEntries(prev => prev.map((entry, i) => i === idx ? { ...entry, [field]: value } : entry));
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { location: '', time: '', opponent: '' }]);
  };

  const removeEntry = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedSchoolId || !selectedSport) {
      setError('Please select a school and a sport.');
      return;
    }
    if (entries.some(entry => !entry.location || !entry.time || !entry.opponent)) {
      setError('Please fill out all fields for each schedule entry.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addScheduleToSchool(selectedSchoolId, selectedSport, entries, selectedSchool?.name || '');
      // Also add to opponent's school schedule if opponent is a school
      for (const entry of entries) {
        const opponentSchool = schools.find(s => s.name === entry.opponent);
        if (opponentSchool && opponentSchool.id) {
          // Add the same entry, but with the selected school as the opponent
          const opponentEntry = {
            location: entry.location,
            time: entry.time,
            opponent: selectedSchool?.name || '',
          };
          await addScheduleToSchool(opponentSchool.id, selectedSport, [opponentEntry], opponentSchool.name);
        }
      }
      setMessage('Schedule added successfully!');
      setSelectedSchoolId('');
      setSelectedSport('');
      setEntries([{ location: '', time: '', opponent: '' }]);
    } catch (err: any) {
      setError(err?.message || 'Failed to add schedule.');
    } finally {
      setIsSubmitting(false);
      if (typeof reloadSchools === 'function') reloadSchools();
    }
  };

  // Add new external team
  const handleAddExternalTeam = () => {
    if (!newTeamName) return;
    setExternalTeams(prev => [
      ...prev,
      {
        name: newTeamName,
        logoUrl: newTeamLogo ? URL.createObjectURL(newTeamLogo) : sportIcons[selectedSport] || '',
        sport: selectedSport,
      },
    ]);
    setShowAddTeam(false);
    setNewTeamName('');
    setNewTeamLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mb-10 space-y-6">
        <h2 className="text-2xl font-semibold text-primary-600 mb-4">Add Schedule</h2>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">School *</label>
          <select
            value={selectedSchoolId}
            onChange={e => {
              setSelectedSchoolId(e.target.value);
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
            disabled={!selectedSchoolId || isSubmitting}
          >
            <option value="">Select a sport</option>
            {availableSports.map(sport => (
              <option key={sport} value={sport}>{sport.charAt(0).toUpperCase() + sport.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Schedules *</label>
          <div className="space-y-4">
            {entries.map((entry, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 bg-primary-50 p-4 rounded-lg w-full">
                <input
                  type="text"
                  placeholder="Location"
                  value={entry.location}
                  onChange={e => handleEntryChange(idx, 'location', e.target.value)}
                  className="w-full md:flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="datetime-local"
                  placeholder="Time"
                  value={entry.time}
                  onChange={e => handleEntryChange(idx, 'time', e.target.value)}
                  className="w-full md:flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                  disabled={isSubmitting}
                />
                <select
                  value={entry.opponent}
                  onChange={e => {
                    if (e.target.value === '__add_new__') {
                      setShowAddTeam(true);
                    } else {
                      handleEntryChange(idx, 'opponent', e.target.value);
                    }
                  }}
                  className="w-full md:flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Opponent</option>
                  {schools
                    .filter(s => s.id !== selectedSchoolId)
                    .map(school => (
                      <option key={school.id} value={school.name}>{school.name}</option>
                    ))}
                  {externalTeams
                    .filter(team => team.sport === selectedSport)
                    .map((team, i) => (
                      <option key={team.name + i} value={team.name}>{team.name} (External)</option>
                    ))}
                  <option value="__add_new__">+ Add New Team</option>
                </select>
                {/* Add New Team Modal/Form */}
                {showAddTeam && (
                  <div className="bg-white border border-primary-200 rounded-lg p-4 mt-2 shadow-lg z-50">
                    <div className="mb-2 font-semibold text-primary-700">Add New Team</div>
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
                      onClick={handleAddExternalTeam}
                    >
                      Add Team
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-4 py-1 rounded"
                      onClick={() => setShowAddTeam(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(idx)}
                    className="md:ml-2 text-red-500 hover:text-red-700 font-bold text-lg self-end md:self-auto"
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addEntry}
            className="mt-3 bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold py-1 px-4 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            + Add Another
          </button>
        </div>
        {error && <div className="text-red-600 text-center font-bold">{error}</div>}
        {message && <div className="text-green-600 text-center font-bold">{message}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Schedule'}
        </button>
      </form>
      {/* Existing Schedules List */}
      <div className="w-full max-w-lg mb-10">
        <h3 className="text-xl font-semibold text-primary-700 mb-2">Existing Games</h3>
        {loadingSchedules ? (
          <div className="text-center py-4">Loading...</div>
        ) : existingSchedules.length === 0 ? (
          <div className="text-primary-400 text-center">No games scheduled for this sport.</div>
        ) : (
          <ul className="space-y-3">
            {existingSchedules.map((entry, idx) => (
              <li key={idx} className="flex flex-col md:flex-row md:items-center gap-2 bg-primary-50 p-3 rounded-lg w-full">
                <div className="flex-1">
                  {/* Format: (School name) @ Opponent or (School name) vs Opponent, then location, then time */}
                  <span className="font-semibold">
                    {selectedSchool?.name} vs {entry.opponent}
                  </span>
                  <span className="ml-2">| {entry.location}</span>
                  <span className="ml-2">| {entry.time}</span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 font-bold text-lg self-end md:self-auto"
                  onClick={() => handleDeleteSchedule(entry)}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminAddSchedule; 