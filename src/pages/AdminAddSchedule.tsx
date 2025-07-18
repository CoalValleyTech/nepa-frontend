import React, { useState } from 'react';
import { School, addScheduleToSchool } from '../services/firebaseService';

interface AdminAddScheduleProps {
  schools: School[];
}

interface ScheduleEntry {
  location: string;
  time: string;
  opponent: string;
}

const AdminAddSchedule: React.FC<AdminAddScheduleProps> = ({ schools }) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [entries, setEntries] = useState<ScheduleEntry[]>([
    { location: '', time: '', opponent: '' }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSchool = schools.find(s => s.id === selectedSchoolId);
  const availableSports = selectedSchool?.sports || [];

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
      setMessage('Schedule added successfully!');
      setSelectedSchoolId('');
      setSelectedSport('');
      setEntries([{ location: '', time: '', opponent: '' }]);
    } catch (err: any) {
      setError(err.message || 'Failed to add schedule.');
    } finally {
      setIsSubmitting(false);
    }
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
              <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-primary-50 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Location"
                  value={entry.location}
                  onChange={e => handleEntryChange(idx, 'location', e.target.value)}
                  className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="datetime-local"
                  placeholder="Time"
                  value={entry.time}
                  onChange={e => handleEntryChange(idx, 'time', e.target.value)}
                  className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                  disabled={isSubmitting}
                />
                <select
                  value={entry.opponent}
                  onChange={e => handleEntryChange(idx, 'opponent', e.target.value)}
                  className="flex-1 px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Opponent</option>
                  {schools
                    .filter(s => s.id !== selectedSchoolId)
                    .map(school => (
                      <option key={school.id} value={school.name}>{school.name}</option>
                    ))}
                </select>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(idx)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
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
    </div>
  );
};

export default AdminAddSchedule; 