import React, { useState } from 'react';
import { School, addSportToSchool } from '../services/firebaseService';

interface AdminAddSportProps {
  schools: School[];
}

const SPORTS = [
  { value: 'football', label: 'Football (Boys)' },
  { value: 'tennis', label: 'Girls Tennis' },
  { value: 'cross-country-boys', label: 'Cross Country (Boys)' },
  { value: 'cross-country-girls', label: 'Cross Country (Girls)' },
  { value: 'field-hockey', label: 'Field Hockey (Girls)' },
  { value: 'golf-boys', label: 'Golf (Boys)' },
  { value: 'golf-girls', label: 'Golf (Girls)' },
  { value: 'soccer-boys', label: 'Soccer (Boys)' },
  { value: 'soccer-girls', label: 'Soccer (Girls)' },
  { value: 'volleyball', label: 'Girls Volleyball' },
];

const AdminAddSport: React.FC<AdminAddSportProps> = ({ schools }) => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedSchool || !selectedSport) {
      setError('Please select a school and a sport.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addSportToSchool(selectedSchool, selectedSport);
      setMessage(`Added ${SPORTS.find(s => s.value === selectedSport)?.label} to ${schools.find(s => s.id === selectedSchool)?.name}`);
      setSelectedSchool('');
      setSelectedSport('');
    } catch (err: any) {
      setError(err.message || 'Failed to add sport.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mb-10 space-y-6">
        <h2 className="text-2xl font-semibold text-primary-600 mb-4">Add a Sport to a School</h2>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">School *</label>
          <select
            value={selectedSchool}
            onChange={e => setSelectedSchool(e.target.value)}
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
            disabled={isSubmitting}
          >
            <option value="">Select a sport</option>
            {SPORTS.map(sport => (
              <option key={sport.value} value={sport.value}>{sport.label}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600 text-center font-bold">{error}</div>}
        {message && <div className="text-green-600 text-center font-bold">{message}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add Sport'}
        </button>
      </form>
    </div>
  );
};

export default AdminAddSport; 