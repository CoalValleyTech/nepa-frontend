import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Home = () => {
  // Sample scores data
  const scores = [
    { homeTeam: "Scranton", homeScore: 24, awayScore: 21, awayTeam: "Wilkes-Barre", status: "LIVE" },
    { homeTeam: "Hazleton", homeScore: 35, awayScore: 28, awayTeam: "Pittston", status: "FINAL" },
    { homeTeam: "Abington", homeScore: 14, awayScore: 17, awayTeam: "Valley View", status: "FINAL" },
    { homeTeam: "North Pocono", homeScore: 42, awayScore: 7, awayTeam: "West Scranton", status: "FINAL" },
    { homeTeam: "Delaware Valley", homeScore: 21, awayScore: 21, awayTeam: "Scranton Prep", status: "FINAL" },
    { homeTeam: "Lakeland", homeScore: 0, awayScore: 0, awayTeam: "Carbondale", status: "7:00 PM" },
    { homeTeam: "Riverside", homeScore: 28, awayScore: 14, awayTeam: "Old Forge", status: "FINAL" },
    { homeTeam: "Dunmore", homeScore: 31, awayScore: 17, awayTeam: "Mid Valley", status: "FINAL" },
    { homeTeam: "Lackawanna Trail", homeScore: 0, awayScore: 0, awayTeam: "Susquehanna", status: "7:30 PM" },
  ]

  // Sample schedule data
  const schedule = [
    { homeTeam: "Scranton", awayTeam: "Wilkes-Barre", date: "Sep 20", time: "7:00 PM", venue: "Scranton Stadium" },
    { homeTeam: "Hazleton", awayTeam: "Pittston", date: "Sep 21", time: "7:30 PM", venue: "Hazleton Field" },
    { homeTeam: "Abington", awayTeam: "Valley View", date: "Sep 22", time: "7:00 PM", venue: "Abington Complex" },
    { homeTeam: "North Pocono", awayTeam: "West Scranton", date: "Sep 23", time: "7:30 PM", venue: "North Pocono Stadium" },
    { homeTeam: "Delaware Valley", awayTeam: "Scranton Prep", date: "Sep 24", time: "7:00 PM", venue: "Delaware Valley Field" },
    { homeTeam: "Lakeland", awayTeam: "Carbondale", date: "Sep 25", time: "7:30 PM", venue: "Lakeland Stadium" },
    { homeTeam: "Riverside", awayTeam: "Old Forge", date: "Sep 26", time: "7:00 PM", venue: "Riverside Complex" },
    { homeTeam: "Dunmore", awayTeam: "Mid Valley", date: "Sep 27", time: "7:30 PM", venue: "Dunmore Field" },
    { homeTeam: "Lackawanna Trail", awayTeam: "Susquehanna", date: "Sep 28", time: "7:00 PM", venue: "Lackawanna Stadium" },
  ]

  // Sample articles data
  const articles = [
    {
      title: "Scranton High Dominates in Season Opener",
      excerpt: "The Knights showed exceptional teamwork and strategy in their 42-14 victory over West Scranton. Quarterback Mike Johnson threw for 3 touchdowns while the defense held the opposition to just 2 scores.",
      date: "September 15, 2024",
      category: "Game Recap"
    },
    {
      title: "Player Spotlight: Quarterback Mike Johnson",
      excerpt: "Senior quarterback Mike Johnson has been leading the charge for Hazleton Area with impressive stats. Through 3 games, Johnson has thrown for 8 touchdowns and rushed for 3 more.",
      date: "September 14, 2024",
      category: "Player Profile"
    },
    {
      title: "Week 3 Preview: Key Matchups to Watch",
      excerpt: "This weekend features several crucial games that could determine playoff positioning. The Scranton vs. Wilkes-Barre matchup is the game of the week with both teams undefeated.",
      date: "September 13, 2024",
      category: "Preview"
    },
    {
      title: "Coaching Changes Impact Local Teams",
      excerpt: "Several NEPA schools have new head coaches this season, bringing fresh strategies and energy to their programs. The impact is already being felt on the field.",
      date: "September 12, 2024",
      category: "News"
    }
  ]

  // State for rotating articles
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)

  // Rotate articles every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArticleIndex((prevIndex) => 
        prevIndex === articles.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [articles.length])

  return (
    <div className="min-h-screen">
      {/* Main Content Section with Scores and Schedule Sidebars */}
      <section className="py-8 bg-cream-50">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Side - Single Rotating Article */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-primary-500 mb-6">Latest News</h2>
              <div className="bg-cream-100 rounded-lg p-6 lg:p-8 shadow-lg">
                <article className="transition-opacity duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">
                      {articles[currentArticleIndex].category}
                    </span>
                    <span className="text-sm text-primary-500">{articles[currentArticleIndex].date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary-600 mb-4">
                    {articles[currentArticleIndex].title}
                  </h3>
                  <p className="text-primary-600 leading-relaxed text-lg mb-6">
                    {articles[currentArticleIndex].excerpt}
                  </p>
                  <button className="text-secondary-500 hover:text-secondary-600 font-semibold text-lg transition-colors duration-200">
                    Read Full Article →
                  </button>
                </article>
                
                {/* Article navigation dots */}
                <div className="flex justify-center mt-6 space-x-2">
                  {articles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentArticleIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === currentArticleIndex 
                          ? 'bg-secondary-500' 
                          : 'bg-primary-300 hover:bg-primary-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical Line Divider */}
            <div className="hidden lg:block w-px bg-primary-300 mx-2"></div>

            {/* Right Side - Scores and Schedule Sections */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:w-auto">
              {/* Scores Section */}
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                <h2 className="text-2xl font-bold text-primary-500 mb-6 text-center">Scores</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scores.map((score, index) => (
                    <div key={index} className="bg-cream-100 rounded-lg p-3 lg:p-4 border-l-4 border-secondary-500 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          score.status === 'LIVE' 
                            ? 'text-red-600 bg-red-100' 
                            : score.status === 'FINAL'
                            ? 'text-green-600 bg-green-100'
                            : 'text-yellow-600 bg-yellow-100'
                        }`}>
                          {score.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-cream-100 font-bold text-xs">
                              {score.homeTeam.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-primary-600 truncate">
                            {score.homeTeam}
                          </span>
                        </div>
                        
                        {/* Score */}
                        <div className="text-base font-bold text-primary-500 mx-2 flex-shrink-0">
                          {score.homeScore} - {score.awayScore}
                        </div>
                        
                        {/* Away Team */}
                        <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end">
                          <span className="text-sm font-semibold text-primary-600 truncate">
                            {score.awayTeam}
                          </span>
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-cream-100 font-bold text-xs">
                              {score.awayTeam.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/stats"
                    className="inline-block bg-secondary-500 text-cream-100 px-4 py-2 rounded-lg hover:bg-secondary-600 transition-colors duration-200 text-sm font-semibold"
                  >
                    View All Scores & Statistics →
                  </Link>
                </div>
              </div>

              {/* Vertical Line Divider between Scores and Schedule */}
              <div className="hidden lg:block w-px bg-primary-300"></div>

              {/* Schedule Section */}
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                <h2 className="text-2xl font-bold text-primary-500 mb-6 text-center">Schedule</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {schedule.map((game, index) => (
                    <div key={index} className="bg-cream-100 rounded-lg p-3 lg:p-4 border-l-4 border-primary-500 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                          {game.date}
                        </span>
                        <span className="text-xs font-semibold text-secondary-600">
                          {game.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        {/* Home Team */}
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-cream-100 font-bold text-xs">
                              {game.homeTeam.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-primary-600 truncate">
                            {game.homeTeam}
                          </span>
                        </div>
                        
                        {/* VS */}
                        <div className="text-xs font-bold text-primary-400 mx-2 flex-shrink-0">
                          VS
                        </div>
                        
                        {/* Away Team */}
                        <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end">
                          <span className="text-sm font-semibold text-primary-600 truncate">
                            {game.awayTeam}
                          </span>
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-cream-100 font-bold text-xs">
                              {game.awayTeam.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-primary-500 truncate">
                        📍 {game.venue}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/schedule"
                    className="inline-block bg-secondary-500 text-cream-100 px-4 py-2 rounded-lg hover:bg-secondary-600 transition-colors duration-200 text-sm font-semibold"
                  >
                    View Full Schedule →
                  </Link>
                </div>
              </div>
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
              At NEPA Football Broadcast, we are dedicated to showcasing the passion, talent, and community spirit 
              of high school football throughout Northeastern Pennsylvania. Our mission is to provide comprehensive 
              coverage that celebrates the achievements of student-athletes, coaches, and teams while connecting 
              families, alumni, and fans with the excitement of Friday night lights.
            </p>
            <p>
              Through live broadcasting, detailed statistics, and engaging content, we strive to preserve the 
              rich tradition of high school football in our region while building a platform that supports 
              the growth and development of the sport for future generations.
            </p>
            <p className="text-secondary-300 font-semibold">
              Supporting NEPA Football - One Game at a Time
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 