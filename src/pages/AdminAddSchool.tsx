import React, { useState } from 'react';
import { School, addSchool, getSchools, deleteSchool } from '../services/firebaseService';

interface AdminAddSchoolProps {
  schools: School[];
  setSchools: (schools: School[]) => void;
  schoolsLoading: boolean;
  setSchoolsLoading: (loading: boolean) => void;
}

const AdminAddSchool: React.FC<AdminAddSchoolProps> = ({ schools, setSchools, schoolsLoading, setSchoolsLoading }) => {
  const [schoolForm, setSchoolForm] = useState<{ name: string; location: string; logo: File | null }>({
    name: '',
    location: '',
    logo: null,
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSchools = async (retry = false) => {
    try {
      setSchoolsLoading(true);
      setError('');
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load schools. Please try again.');
    } finally {
      setSchoolsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files) {
      setSchoolForm(prev => ({ ...prev, logo: files[0] }));
    } else {
      setSchoolForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      if (!schoolForm.name || !schoolForm.location) {
        setError('Please fill out all required fields.');
        return;
      }
      if (schoolForm.logo && schoolForm.logo.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB.');
        return;
      }
      await addSchool(
        {
          name: schoolForm.name.trim(),
          location: schoolForm.location.trim(),
        },
        schoolForm.logo || undefined
      );
      setSchoolForm({ name: '', location: '', logo: null });
      setMessage('School added successfully!');
      await loadSchools();
    } catch (error: any) {
      setError(error.message || 'Failed to add school. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchool = async (schoolId: string, logoUrl?: string) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    try {
      await deleteSchool(schoolId, logoUrl);
      setMessage('School deleted successfully!');
      await loadSchools();
    } catch (error: any) {
      setError(error.message || 'Failed to delete school. Please try again.');
    }
  };

  const handleRetryLoad = () => {
    loadSchools();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <form onSubmit={handleAddSchool} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg mb-10 space-y-6">
        <h2 className="text-2xl font-semibold text-primary-600 mb-4">Add a School</h2>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">School Name *</label>
          <input
            type="text"
            name="name"
            value={schoolForm.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            required
            disabled={isSubmitting}
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Location *</label>
          <input
            type="text"
            name="location"
            value={schoolForm.location}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            required
            disabled={isSubmitting}
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Logo (Optional - Max 5MB)</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full"
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
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </div>
          ) : (
            'Add School'
          )}
        </button>
      </form>
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-700">Schools List</h2>
          <button
            onClick={handleRetryLoad}
            disabled={schoolsLoading}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {schoolsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        {schoolsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <div>Loading schools...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={handleRetryLoad}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-8 text-primary-500">No schools added yet. Add your first school above!</div>
        ) : (
          <ul className="space-y-4">
            {schools.map(school => (
              <li key={school.id} className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  {school.logoUrl ? (
                    <img 
                      src={school.logoUrl} 
                      alt={school.name + ' logo'} 
                      className="h-16 w-16 object-contain rounded mr-4" 
                    />
                  ) : (
                    <div className="h-16 w-16 bg-primary-100 rounded mr-4 flex items-center justify-center">
                      <span className="text-primary-500 text-xs">No Logo</span>
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg text-primary-700">{school.name}</div>
                    <div className="text-primary-500">{school.location}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSchool(school.id!, school.logoUrl)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
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

export default AdminAddSchool; 