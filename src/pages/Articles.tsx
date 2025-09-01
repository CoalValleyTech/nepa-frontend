import { useState, useEffect } from 'react';
import { getArticles, Article } from '../services/firebaseService';

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  // Load articles from Firebase
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError('');
        const articlesData = await getArticles();
        setArticles(articlesData);
      } catch (error: any) {
        console.error('Error loading articles:', error);
        setError(error.message || 'Failed to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Get filtered articles based on selected sport
  const getFilteredArticles = () => {
    return articles;
  };

  const filteredArticles = getFilteredArticles();

  // Handle article selection for modal
  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowArticleModal(false);
    setSelectedArticle(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-primary-600 text-center">
              Articles
            </h1>
            <p className="text-lg text-gray-600 text-center mt-2">
              Stay updated with the latest news and stories from NEPA sports
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-primary-600 text-center">
              Articles
            </h1>
            <p className="text-lg text-gray-600 text-center mt-2">
              Stay updated with the latest news and stories from NEPA sports
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-primary-600 text-center">
            Articles
          </h1>
          <p className="text-lg text-gray-600 text-center mt-2">
            Stay updated with the latest news and stories from NEPA sports
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredArticles.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-primary-600 text-center mb-8">
                All Articles
                <span className="text-gray-500 text-lg font-normal ml-2">
                  ({filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {filteredArticles.map((article, index) => (
                  <article 
                    key={article.id || index} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    {article.image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-primary-500 font-semibold bg-primary-50 px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(article.date)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors">
                          Read More →
                        </span>
                        {index === 0 && (
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            FEATURED
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-6xl text-gray-300 mb-4">📰</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Articles Found
              </h3>
              <p className="text-gray-500">
                We're working on bringing you the latest sports news and stories from around NEPA.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Full-Screen Article Modal */}
      {showArticleModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-primary-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-primary-100 bg-primary-600 px-3 py-1 rounded-full text-sm">
                      {selectedArticle.category}
                    </span>
                    <span className="text-primary-100 text-sm">
                      {formatDate(selectedArticle.date)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedArticle.image && (
                <div className="mb-6">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {selectedArticle.excerpt}
                </p>
                {selectedArticle.content && (
                  <div className="mt-6 text-gray-700 leading-relaxed">
                    {selectedArticle.content}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Published on {formatDate(selectedArticle.date)}
                </span>
                <button
                  onClick={closeModal}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles; 