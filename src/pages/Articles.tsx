import { useState, useEffect } from 'react';
import { getArticles, Article } from '../services/firebaseService';

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Get unique categories for filtering
  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category)))];
  


  // Get top stories (first 3 articles)
  const topStories = articles.slice(0, 3);

  // Define sport sections with icons and colors
  const sportSections = [
    {
      name: 'Football',
      icon: '🏈',
      color: 'primary',
      categories: ['Football', 'Game Recap', 'Player Profile', 'Team News']
    },
    {
      name: 'Tennis',
      icon: '🎾',
      color: 'secondary',
      categories: ['Tennis', 'Match Report', 'Tournament', 'Player Spotlight']
    },
    {
      name: 'Basketball',
      icon: '🏀',
      color: 'blue',
      categories: ['Basketball', 'Game Summary', 'Season Preview', 'Team Update']
    },
    {
      name: 'Baseball',
      icon: '⚾',
      color: 'green',
      categories: ['Baseball', 'Game Analysis', 'Player Feature', 'League News']
    },
    {
      name: 'Soccer',
      icon: '⚽',
      color: 'purple',
      categories: ['Soccer', 'Match Report', 'Tournament', 'Team News']
    },
    {
      name: 'Other Sports',
      icon: '🏃',
      color: 'gray',
      categories: ['Track', 'Swimming', 'Golf', 'Volleyball', 'General Sports']
    }
  ];

  // Get articles for each sport section
  const getSportArticles = (sport: typeof sportSections[0]) => {
    return articles.filter(article => 
      sport.categories.some(category => 
        article.category.toLowerCase().includes(category.toLowerCase()) ||
        article.title.toLowerCase().includes(sport.name.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(sport.name.toLowerCase())
      )
    );
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

  // Get color classes for sport sections
  const getSportColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      primary: {
        bg: 'bg-primary-50',
        text: 'text-primary-700',
        border: 'border-primary-200',
        hover: 'hover:bg-primary-100'
      },
      secondary: {
        bg: 'bg-secondary-50',
        text: 'text-secondary-700',
        border: 'border-secondary-200',
        hover: 'hover:bg-secondary-100'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        hover: 'hover:bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100'
      },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-100'
      }
    };
    return colorMap[color] || colorMap.gray;
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

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Stories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Stories Section */}
      {topStories.length > 0 && (
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary-600 text-center mb-8">
              Top Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {topStories.map((article, index) => (
                <article 
                  key={article.id || index} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
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
                      <span className="text-sm text-primary-500 font-semibold">
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
                      <span className="text-primary-600 font-semibold text-sm">
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
          </div>
        </section>
      )}

      {/* Sport-Specific Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-600 text-center mb-12">
            Browse Articles by Sport
          </h2>
          
          <div className="space-y-12">
            {sportSections.map((sport) => {
              const sportArticles = getSportArticles(sport);
              const colors = getSportColorClasses(sport.color);
              
              if (sportArticles.length === 0) return null;
              
              return (
                <div key={sport.name} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Sport Section Header */}
                  <div className={`${colors.bg} ${colors.border} border-b px-6 py-4`}>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{sport.icon}</span>
                      <div>
                        <h3 className={`text-2xl font-bold ${colors.text}`}>
                          {sport.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {sportArticles.length} article{sportArticles.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Articles Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sportArticles.map((article, index) => (
                        <article 
                          key={article.id || index} 
                          className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border ${colors.border} hover:scale-[1.02]`}
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
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                                {article.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(article.date)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {article.excerpt}
                            </p>
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <span className={`${colors.text} font-semibold text-sm hover:opacity-80 transition-opacity cursor-pointer`}>
                                Read Full Story →
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* No Articles Message */}
          {articles.length === 0 && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-6xl text-gray-300 mb-4">📰</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Articles Yet
              </h3>
              <p className="text-gray-500">
                We're working on bringing you the latest sports news and stories from around NEPA.
              </p>
            </div>
          )}
        </div>
      </section>

      
    </div>
  );
};

export default Articles; 