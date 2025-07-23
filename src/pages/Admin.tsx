import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { School, getSchools, updateSchoolScheduleEntry, deleteScheduleEntry, addArticle, getArticles, deleteArticle, Article } from '../services/firebaseService';
import AdminAddSchool from './AdminAddSchool';
import AdminAddSport from './AdminAddSport';
import AdminAddSchedule from './AdminAddSchedule';
import AdminAddGame from './AdminAddGame';

const allowedAdmins = ['batesnate958@gmail.com', 'mnovak03@outlook.com'];

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [activeTab, setActiveTab] = useState<'addSchool' | 'addSport' | 'addSchedule' | 'addGame' | 'editSchedule' | 'addArticle'>('addSchool');
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [expandedSport, setExpandedSport] = useState<{ [schoolId: string]: string | null }>({});
  const [editingGame, setEditingGame] = useState<{ schoolId: string; sport: string; idx: number } | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleForm, setArticleForm] = useState({ 
    title: '', 
    excerpt: '', 
    content: '', 
    date: '', 
    category: ''
  });
  const [articleImage, setArticleImage] = useState<string | null>(null);
  const handleArticleChange = (field: string, value: string) => setArticleForm(prev => ({ ...prev, [field]: value }));
  const handleArticleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArticleImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setArticleImage(null);
    }
  };
  const handleAddArticle = async () => {
    console.log('handleAddArticle called');
    console.log('articleForm:', articleForm);
    console.log('articleImage:', articleImage);
    
    if (!articleForm.title || !articleForm.excerpt || !articleForm.date || !articleForm.category) {
      console.log('Validation failed:');
      console.log('title:', articleForm.title);
      console.log('excerpt:', articleForm.excerpt);
      console.log('date:', articleForm.date);
      console.log('category:', articleForm.category);
      return;
    }
    
    try {
      console.log('Adding article to Firebase...');
      
      // Create article data without undefined fields
      const articleData: any = {
        title: articleForm.title,
        excerpt: articleForm.excerpt,
        content: articleForm.content,
        date: articleForm.date,
        category: articleForm.category
      };
      
      // Only add image if it exists
      if (articleImage) {
        articleData.image = articleImage;
      }
      
      await addArticle(articleData);
      console.log('Article added successfully');
      setArticleForm({ title: '', excerpt: '', content: '', date: '', category: '' });
      setArticleImage(null);
      loadArticles();
    } catch (error) {
      console.error('Error adding article:', error);
    }
  };
  const handleDeleteArticle = async (idx: number) => {
    const articleToDelete = articles[idx];
    if (articleToDelete.id) {
      await deleteArticle(articleToDelete.id);
      setArticles(articles.filter((_, i) => i !== idx));
    }
  };
  const [archivedArticles, setArchivedArticles] = useState<Article[]>(() => {
    const stored = localStorage.getItem('archivedArticles');
    return stored ? JSON.parse(stored) : [];
  });
  const handleArchiveArticle = (idx: number) => {
    const articleToArchive = articles[idx];
    const newArticles = articles.filter((_, i) => i !== idx);
    const newArchived = [articleToArchive, ...archivedArticles];
    setArticles(newArticles);
    setArchivedArticles(newArchived);
    localStorage.setItem('articles', JSON.stringify(newArticles));
    localStorage.setItem('archivedArticles', JSON.stringify(newArchived));
  };
  const handleDeleteArchivedArticle = (idx: number) => {
    const newArchived = archivedArticles.filter((_, i) => i !== idx);
    setArchivedArticles(newArchived);
    localStorage.setItem('archivedArticles', JSON.stringify(newArchived));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
      } else if (!allowedAdmins.includes(user.email || '')) {
        navigate('/login');
      } else {
        setLoading(false);
        loadSchools();
        loadArticles();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadSchools = async () => {
    try {
      setSchoolsLoading(true);
      const schoolsData = await getSchools();
      setSchools(schoolsData);
    } catch (error) {
      // Optionally handle error
    } finally {
      setSchoolsLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const articlesData = await getArticles();
      setArticles(articlesData);
    } catch (error) {
      console.error("Error loading articles:", error);
    }
  };

  const handleEditClick = (schoolId: string, sport: string, idx: number, game: any) => {
    setEditingGame({ schoolId, sport, idx });
    setEditForm({ ...game });
  };
  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = async (schoolId: string, sport: string, oldGame: any) => {
    // For now, just update the entry in Firestore and close the form
    await updateSchoolScheduleEntry(schoolId, sport, oldGame, editForm);
    setEditingGame(null);
  };
  const handleDeleteGame = async (schoolId: string, sport: string, game: any) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    await deleteScheduleEntry(schoolId, sport, game);
    if (typeof loadSchools === 'function') loadSchools();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

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
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <h1 className="text-3xl font-bold text-primary-700 mb-8">Admin Dashboard</h1>
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
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Edit Schedule</h2>
              <div className="text-primary-500 mb-6">(Select a school to edit its sports schedules)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {schools.map(school => {
                  const schoolId = school.id || '';
                  const selectedSport = expandedSport[schoolId] || '';
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
                                className={`px-3 py-1 rounded-lg border font-semibold ${selectedSport === sport ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'}`}
                                onClick={e => { e.stopPropagation(); setExpandedSport(prev => ({ ...prev, [schoolId]: selectedSport === sport ? '' : sport })); }}
                              >
                                {sport.charAt(0).toUpperCase() + sport.slice(1)}
                              </button>
                            ))}
                          </div>
                          {selectedSport && (
                            <div className="bg-primary-50 rounded-lg p-4">
                              <div className="font-semibold text-primary-700 mb-2">Games for {selectedSport}</div>
                              <ul className="space-y-2">
                                {Array.isArray((school as any).schedules?.[selectedSport]) && (school as any).schedules[selectedSport].length > 0 ? (
                                  (school as any).schedules[selectedSport].map((game: any, idx: number) => {
                                    const isEditing = editingGame && editingGame.schoolId === schoolId && editingGame.sport === selectedSport && editingGame.idx === idx;
                                    return (
                                      <li key={idx} className="flex flex-col md:flex-row md:items-center gap-2 bg-white rounded shadow p-2">
                                        {isEditing ? (
                                          <div className="flex flex-col gap-2 w-full">
                                            <input type="datetime-local" value={editForm.time || ''} onChange={e => handleEditChange('time', e.target.value)} className="border rounded px-2 py-1" />
                                            <input type="text" value={editForm.location || ''} onChange={e => handleEditChange('location', e.target.value)} placeholder="Location" className="border rounded px-2 py-1" />
                                            <input type="text" value={editForm.opponent || ''} onChange={e => handleEditChange('opponent', e.target.value)} placeholder="Opponent" className="border rounded px-2 py-1" />
                                            <input type="text" value={editForm.status || ''} onChange={e => handleEditChange('status', e.target.value)} placeholder="Status" className="border rounded px-2 py-1" />
                                            <div className="flex gap-2 mt-2">
                                              <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleEditSave(schoolId, selectedSport, game)}>Save</button>
                                              <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded" onClick={() => setEditingGame(null)}>Cancel</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <span className="font-bold text-primary-700">{game.time ? new Date(game.time).toLocaleString() : ''}</span>
                                            <span className="text-primary-600">{game.location}</span>
                                            <span className="text-primary-500">vs {game.opponent}</span>
                                            {game.status && <span className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-700">{game.status}</span>}
                                            {game.score && (game.score.home?.final || game.score.away?.final) && (
                                              <span className="ml-auto font-bold text-green-700">{game.score.home?.final ?? '-'} - {game.score.away?.final ?? '-'}</span>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                              <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEditClick(schoolId, selectedSport, idx, game)}>Edit</button>
                                              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDeleteGame(schoolId, selectedSport, game)}>Delete</button>
                                            </div>
                                          </>
                                        )}
                                      </li>
                                    );
                                  })
                                ) : (
                                  <li className="text-primary-400">No games scheduled for this sport.</li>
                                )}
                              </ul>
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
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <h2 className="text-2xl font-bold text-primary-700 mb-4">Add Article</h2>
              {/* Article Preview */}
              <div className="w-full max-w-lg mx-auto bg-cream-100 rounded-lg p-6 shadow-lg mb-8">
                <h4 className="text-lg font-bold text-primary-700 mb-2">Article Preview</h4>
                <article className="transition-opacity duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">
                      {articleForm.category || 'Category'}
                    </span>
                    <span className="text-sm text-primary-500">{articleForm.date || 'Date'}</span>
                  </div>
                  {articleImage && (
                    <img src={articleImage} alt="Preview" className="w-full h-48 object-cover rounded mb-4" />
                  )}
                  <h3 className="text-2xl font-bold text-primary-600 mb-4">
                    {articleForm.title || 'Article Title'}
                  </h3>
                  <p className="text-primary-600 leading-relaxed text-lg mb-6">
                    {articleForm.excerpt || 'Article excerpt will appear here.'}
                  </p>
                  {articleForm.content && (
                    <div className="text-primary-600 leading-relaxed text-base mb-6">
                      <p className="font-semibold mb-2">Full Content Preview:</p>
                      <div className="whitespace-pre-wrap">
                        {articleForm.content}
                      </div>
                    </div>
                  )}
                  <button className="text-secondary-500 hover:text-secondary-600 font-semibold text-lg transition-colors duration-200" disabled>
                    Read Full Article →
                  </button>
                </article>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 w-full">
                <div className="mb-4 space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">Title *</label>
                      <input 
                        type="text" 
                        placeholder="Article Title" 
                        value={articleForm.title} 
                        onChange={e => handleArticleChange('title', e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!articleForm.title ? 'border-red-300 bg-red-50' : 'border-primary-200'}`}
                      />
                      {!articleForm.title && <p className="text-red-500 text-xs mt-1">Title is required</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">Category *</label>
                      <input 
                        type="text" 
                        placeholder="News, Sports, Announcement, etc." 
                        value={articleForm.category} 
                        onChange={e => handleArticleChange('category', e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!articleForm.category ? 'border-red-300 bg-red-50' : 'border-primary-200'}`}
                      />
                      {!articleForm.category && <p className="text-red-500 text-xs mt-1">Category is required</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">Date *</label>
                      <input 
                        type="date" 
                        value={articleForm.date} 
                        onChange={e => handleArticleChange('date', e.target.value)} 
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!articleForm.date ? 'border-red-300 bg-red-50' : 'border-primary-200'}`}
                      />
                      {!articleForm.date && <p className="text-red-500 text-xs mt-1">Date is required</p>}
                    </div>
                    <div>
                      {/* Empty div for grid layout */}
                    </div>
                  </div>
                  
                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Excerpt *</label>
                    <textarea 
                      placeholder="Brief summary of the article (will appear in preview)" 
                      value={articleForm.excerpt} 
                      onChange={e => handleArticleChange('excerpt', e.target.value)} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${!articleForm.excerpt ? 'border-red-300 bg-red-50' : 'border-primary-200'}`}
                      rows={3}
                    />
                    {!articleForm.excerpt && <p className="text-red-500 text-xs mt-1">Excerpt is required</p>}
                  </div>
                  
                  {/* Full Content */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Full Content</label>
                    <div className="mb-2 text-xs text-primary-600">
                      <p>• Use double line breaks for paragraphs</p>
                      <p>• Use <strong>**bold text**</strong> for emphasis</p>
                      <p>• Use <em>*italic text*</em> for italics</p>
                    </div>
                    <textarea 
                      placeholder="Full article content with proper formatting..." 
                      value={articleForm.content} 
                      onChange={e => handleArticleChange('content', e.target.value)} 
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                      rows={8}
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Featured Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleArticleImageChange} 
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                    />
                    {articleImage && (
                      <div className="mt-2">
                        <img src={articleImage} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold w-full transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                  onClick={handleAddArticle}
                  disabled={!articleForm.title || !articleForm.excerpt || !articleForm.date || !articleForm.category}
                >
                  Add Article
                </button>
                {/* Debug info - remove this after testing */}
                <div className="mt-2 text-xs text-gray-500">
                  <p>Debug: Title: "{articleForm.title}" | Excerpt: "{articleForm.excerpt}" | Date: "{articleForm.date}" | Category: "{articleForm.category}"</p>
                  <p>Button disabled: {(!articleForm.title || !articleForm.excerpt || !articleForm.date || !articleForm.category).toString()}</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Existing Articles</h3>
              <ul className="w-full space-y-4">
                {articles.length === 0 && <li className="text-primary-400">No articles yet.</li>}
                {articles.map((article, idx) => (
                  <li key={article.id} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex-1">
                      <div className="font-bold text-primary-700 text-lg">{article.title}</div>
                      <div className="text-primary-500 text-sm mb-1">{article.category} | {article.date}</div>
                      <div className="text-primary-600">{article.excerpt}</div>
                      {article.image && <img src={article.image} alt="Article" className="w-full max-w-xs mt-2 rounded" />}
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded self-end md:self-auto" onClick={() => handleArchiveArticle(idx)}>Archive</button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded self-end md:self-auto" onClick={() => handleDeleteArticle(idx)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Archived Articles Section */}
              {archivedArticles.length > 0 && (
                <div className="w-full mt-10">
                  <h3 className="text-xl font-semibold text-primary-700 mb-2">Archived Articles</h3>
                  <ul className="w-full space-y-4">
                    {archivedArticles.map((article, idx) => (
                      <li key={article.id} className="bg-primary-50 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-2 opacity-70">
                        <div className="flex-1">
                          <div className="font-bold text-primary-700 text-lg">{article.title}</div>
                          <div className="text-primary-500 text-sm mb-1">{article.category} | {article.date}</div>
                          <div className="text-primary-600">{article.excerpt}</div>
                          {article.image && <img src={article.image} alt="Article" className="w-full max-w-xs mt-2 rounded" />}
                        </div>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded self-end md:self-auto" onClick={() => handleDeleteArchivedArticle(idx)}>Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin; 