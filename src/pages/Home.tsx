import { useState, useEffect } from 'react';
import { getSchools, getArticles, getStatsForSport, getGlobalSchedules } from '../services/firebaseService';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [expanded, setExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  
  // Final Games state
  const [finalGames, setFinalGames] = useState<any[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  
  // Divisional Leaders state
  const [divisionalLeaders, setDivisionalLeaders] = useState<any[]>([]);
  const [currentSportIndex, setCurrentSportIndex] = useState(0);
  const [availableSports, setAvailableSports] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Sports configuration for divisional leaders
  const sportsList = [
    { key: 'football', name: 'Football' },
    { key: 'basketball', name: 'Basketball' },
    { key: 'baseball', name: 'Baseball' },
    { key: 'softball', name: 'Softball' },
    { key: 'volleyball', name: 'Volleyball' },
    { key: 'tennis', name: 'Tennis' },
    { key: 'boys-soccer', name: 'Boys Soccer' },
    { key: 'girls-soccer', name: 'Girls Soccer' },
    { key: 'boys-cross-country', name: 'Boys Cross Country' },
    { key: 'girls-cross-country', name: 'Girls Cross Country' },
    { key: 'track', name: 'Track & Field' },
    { key: 'swimming', name: 'Swimming' },
    { key: 'wrestling', name: 'Wrestling' },
    { key: 'field-hockey', name: 'Field Hockey' },
    { key: 'lacrosse', name: 'Lacrosse' },
    { key: 'golf-boys', name: 'Men\'s Golf' },
    { key: 'golf-girls', name: 'Women\'s Golf' }
  ];
  
  // Default article if no articles exist
  const defaultArticle = {
    title: 'Welcome to SPAN SportsHub',
    date: 'July 7, 2025',
    category: 'Welcome',
    excerpt: 'The Scranton Public Athletic Network was established in 2025 to provide student-athletes, families, coaches, and the community... ',
    content: `The Scranton Public Athletic Network was established in 2025 to provide student-athletes, families, coaches, and the community with the most accurate stats provided by the teams. We are committed to keeping our services free to allow for everyone to access our content. 
On the website, you will be able to find all schools located in the Lackawanna Interscholastic Athletics Association and their respective teams. You will also find links to video and radio broadcasts, so you can watch or listen to your favorite teams on the go. You can also find us on Facebook and Instagram, where we will post information, recaps, and leaderboards about all your favorite teams! 
Our current resources only allow us to cover Girls' Tennis and Football for the Fall 2025 Season. As we look to expand into more sports in the coming season, we will look for more opportunities to grow and expand our brand. Stay tuned in the following weeks and months as we announce more exciting things that have yet to come!
`,
  };

  // Show popup on first load
  useEffect(() => {
    setShowPopup(true);
  }, []);

  // Load articles from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const articlesData = await getArticles();
        setArticles(articlesData);
        // Set the first article as selected, or default if none exist
        if (articlesData.length > 0) {
          setSelectedArticle(articlesData[0]);
        } else {
          setSelectedArticle(defaultArticle);
        }
      } catch (error) {
        console.error('Error loading articles:', error);
        setSelectedArticle(defaultArticle); // Fallback to default if loading fails
      }
    };

    loadData();
  }, []);

  // Load schools and final games
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load schools
        const schoolsData = await getSchools();
        setSchools(schoolsData);
        
        // Load final games
        await loadFinalGames();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Load final games with scores
  const loadFinalGames = async () => {
    setGamesLoading(true);
    try {
      const allGames = await getGlobalSchedules();
      
      // Filter for final games with scores
      const finalGamesWithScores = allGames.filter((game: any) => {
        const hasScore = game.score && 
          (game.score.home?.final !== undefined || game.score.away?.final !== undefined);
        return game.status === 'FINAL' && hasScore;
      });
      
      // Sort by time (most recent first)
      finalGamesWithScores.sort((a: any, b: any) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      });
      
      // Limit to 10 most recent games
      setFinalGames(finalGamesWithScores.slice(0, 10));
    } catch (error) {
      console.error('Error loading final games:', error);
      setFinalGames([]);
    } finally {
      setGamesLoading(false);
    }
  };

  // Check available sports when schools are loaded
  useEffect(() => {
    if (schools.length > 0) {
      checkAvailableSports();
    }
  }, [schools]);

  // Load divisional leaders for current sport
  const loadDivisionalLeaders = async (sportKey: string) => {
    try {
      const statsByDivision = await getStatsForSport(sportKey);
      const leaders: any[] = [];
      
      Object.entries(statsByDivision).forEach(([division, teams]) => {
        if (teams.length > 0) {
          // Get the top team (first in the array since it's already sorted by win percentage)
          const topTeam = teams[0];
          // Try to find school by team name, then by school name
          const school = schools.find(s => 
            s.name === topTeam.teamName || 
            s.name === topTeam.teamName.replace(' Boys', '').replace(' Girls', '') ||
            s.name === topTeam.teamName.replace('Boys ', '').replace('Girls ', '')
          );
          leaders.push({
            ...topTeam,
            division,
            schoolLogo: school?.logoUrl,
            sportKey
          });
        }
      });
      
      setDivisionalLeaders(leaders);
    } catch (error) {
      console.error('Error loading divisional leaders:', error);
      setDivisionalLeaders([]);
    }
  };

  // Check which sports have data and load divisional leaders
  const checkAvailableSports = async () => {
    if (schools.length === 0) return;
    
    const sportsWithData: any[] = [];
    
    for (const sport of sportsList) {
      try {
        const statsByDivision = await getStatsForSport(sport.key);
        let hasData = false;
        
        Object.values(statsByDivision).forEach((teams: any) => {
          if (teams.length > 0) {
            hasData = true;
          }
        });
        
        if (hasData) {
          sportsWithData.push(sport);
        }
      } catch (error) {
        console.error(`Error checking data for ${sport.key}:`, error);
      }
    }
    
    setAvailableSports(sportsWithData);
    
    // Load data for the first available sport
    if (sportsWithData.length > 0) {
      loadDivisionalLeaders(sportsWithData[0].key);
    }
  };

  // Rotate through available sports every 15 seconds
  useEffect(() => {
    if (availableSports.length > 0) {
      const currentSport = availableSports[currentSportIndex];
      loadDivisionalLeaders(currentSport.key);
      
      const interval = setInterval(() => {
        setCurrentSportIndex((prev) => (prev + 1) % availableSports.length);
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [currentSportIndex, availableSports]);

  // Auto-refresh final games every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadFinalGames();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-500 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 text-center">
                    <img 
                      src="/span-logo.png" 
                      alt="SPAN Logo" 
                      className="w-48 h-48 object-contain mx-auto mb-4"
                    />
                    <h2 className="text-3xl font-bold text-cream-100">Welcome to SPAN SPORTSHUB</h2>
                  </div>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-cream-100 hover:text-cream-200 text-3xl font-bold leading-none ml-4"
                    aria-label="Close popup"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-6 text-cream-100 text-lg">
                  <p>
                    Welcome to SPAN Sports Hub! We provide statistics, scores, and more for all high schools part of the Lackawanna Interscholastic Athletics Association. Stay tuned as we enter the fall sports season, as we provide you with scores, stats, and leaderboards for all LIAA sports!
                  </p>
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowPopup(false)}
                    className="bg-secondary-500 text-white px-8 py-3 rounded-lg hover:bg-secondary-600 transition-colors font-semibold text-lg"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Section with Scores and Schedule Sidebars */}
        <section className="py-8 bg-cream-50">
          <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Left Side - Latest News and Article */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary-500 mb-6">Latest News</h2>
                
                {/* Article Preview Section */}
                {selectedArticle && (
                  <button
                    className="w-full bg-white rounded-lg shadow p-6 text-left mb-4 cursor-pointer hover:bg-cream-50 transition focus:outline-none focus:ring-2 focus:ring-secondary-400"
                    onClick={() => setExpanded(!expanded)}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse article' : 'Expand article'}
                    type="button"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-400">{selectedArticle.date}</span>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-semibold">
                        {selectedArticle.category || 'Article'}
                      </span>
                    </div>
                    
                    {selectedArticle.image && (
                      <img 
                        src={selectedArticle.image} 
                        alt={selectedArticle.title} 
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    
                    <h3 className="text-xl font-bold text-primary-700 mb-2">{selectedArticle.title}</h3>
                    
                    {selectedArticle.author && (
                      <p className="text-sm text-primary-500 mb-2">By {selectedArticle.author}</p>
                    )}
                    
                    <div className="text-primary-600 mb-2">
                      {expanded ? (
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {selectedArticle.content || selectedArticle.excerpt}
                        </div>
                      ) : (
                        <p>{selectedArticle.excerpt}</p>
                      )}
                    </div>
                    
                    <span className="text-secondary-500 font-semibold hover:underline">
                      {expanded ? 'Show Less' : 'Read Full Article →'}
                    </span>
                  </button>
                )}
                
                {/* No Articles Message */}
                {articles.length === 0 && (
                  <div className="w-full bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-primary-400">No articles available. Check back soon for updates!</p>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> The database is currently empty. Once articles are added through the admin panel, they will appear here automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Vertical Line Divider */}
              <div className="hidden lg:block w-px bg-primary-300 mx-2"></div>
              {/* Right Side - Scores and Schedule Sections */}
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:w-auto">
                {/* Scores Section */}
                <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-primary-500">Scores</h2>
                    <button
                      onClick={loadFinalGames}
                      disabled={gamesLoading}
                      className="text-primary-500 hover:text-primary-600 disabled:text-primary-300 transition-colors"
                      title="Refresh scores"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {gamesLoading ? (
                      <div className="text-center text-primary-400 font-semibold">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                        <p>Loading scores...</p>
                      </div>
                    ) : finalGames.length > 0 ? (
                      finalGames.map((game) => {
                        const homeTeamName = game.schoolName || schools.find(s => s.id === game.schoolId)?.name || 'Unknown Team';
                        const awayTeamName = game.opponent || 'Unknown Team';
                        const homeScore = game.score?.home?.final ?? 0;
                        const awayScore = game.score?.away?.final ?? 0;
                        
                        return (
                          <div key={game.id} className="bg-white rounded-lg shadow p-4 border border-primary-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-primary-500 font-medium">
                                {game.sport && game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
                              </span>
                              <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                                FINAL
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-primary-700 truncate max-w-[120px]">
                                  {homeTeamName}
                                </span>
                                <span className="text-lg font-bold text-primary-600">
                                  {homeScore}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-primary-700 truncate max-w-[120px]">
                                  {awayTeamName}
                                </span>
                                <span className="text-lg font-bold text-primary-600">
                                  {awayScore}
                                </span>
                              </div>
                            </div>
                            
                            {game.location && (
                              <div className="text-xs text-primary-400 mt-2 text-center">
                                {game.location}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-primary-400 font-semibold">
                        <p>No final scores available</p>
                        <p className="text-sm mt-1">Check back after games are completed!</p>
                      </div>
                    )}
                  </div>
                </div>
                                {/* Divisional Leaders Section */}
                {availableSports.length > 0 && (
                  <>
                    <div className="hidden lg:block w-px bg-primary-300"></div>
                    <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                      <h2 className="text-2xl font-bold text-primary-500 mb-6 text-center">Divisional Leaders</h2>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {divisionalLeaders.length > 0 ? (
                          <>
                            {/* Sport Header */}
                            <div className="text-center mb-4 transition-all duration-500 ease-in-out">
                              <h3 className="text-lg font-semibold text-primary-700">
                                {availableSports[currentSportIndex]?.name}
                              </h3>
                              <p className="text-xs text-primary-400">Click to view full rankings</p>
                            </div>
                            
                            {/* Division Leaders */}
                            <div className="transition-all duration-500 ease-in-out">
                              {divisionalLeaders.map((leader) => (
                                <div 
                                  key={`${leader.sportKey}-${leader.division}`}
                                  className="bg-primary-50 rounded-xl shadow p-4 cursor-pointer hover:bg-primary-100 transition-colors mb-3"
                                  onClick={() => navigate(`/sports?selectedSport=${leader.sportKey}`)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {leader.schoolLogo && (
                                        <img 
                                          src={leader.schoolLogo} 
                                          alt={`${leader.teamName} logo`} 
                                          className="h-10 w-10 object-contain rounded bg-white border border-primary-200" 
                                        />
                                      )}
                                      <div>
                                        <div className="font-semibold text-primary-700 text-sm">
                                          {leader.teamName}
                                        </div>
                                        <div className="text-xs text-primary-500">
                                          {leader.division.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-primary-600">
                                        {leader.wins}-{leader.losses}
                                      </div>
                                      <div className="text-xs text-primary-400">
                                        {(leader.winPercentage * 100).toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-primary-400 font-semibold">
                            <p>Loading divisional leaders...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement Section */}
        <section className="py-16 bg-primary-500 text-cream-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <div className="text-lg leading-relaxed space-y-4">
              <p>
              At SPAN, we are dedicated to providing the greater Scranton Area with stats, Scores,
              Leaderboards, and more, and providing a platform where all sports can be recognized equally. It is important to us that we keep our services free and allow anyone to access our content wherever they are at any time. 
              Whether it is seeing that latest score update from your favorite tennis team, to seeing how many yards your son ran during his most recent game, or even seeing where you can stream your favorite sports, we want to be 
              the HUB for all things LIAA!

              </p>
              <p>
              We are determined to preserve the culture and richness of high school sports that the greater Scranton Area was built on, while also launching it into the next generation. We want to support
              all student-athletes by building a platform for all!
              </p>
              <p className="text-secondary-300 font-semibold">
                Supporting NEPA Sports - One Game at a Time
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 