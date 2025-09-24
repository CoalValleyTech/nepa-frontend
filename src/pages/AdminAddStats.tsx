import React, { useState, useEffect } from 'react';
import { getSchools, School } from '../services/firebaseService';

interface LIAAStatsFormData {
  playerName: string;
  teamName: string;
  schoolName: string;
  sport: string;
  division: string;
  season: string;
  
  // Football stats
  passingYards?: number;
  passingTouchdowns?: number;
  rushingYards?: number;
  rushingTouchdowns?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  tackles?: number;
  interceptions?: number;
  sacks?: number;
  
  // Basketball stats
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  threePointersMade?: number;
  threePointersAttempted?: number;
  freeThrowsMade?: number;
  freeThrowsAttempted?: number;
  
  // Baseball/Softball stats
  battingAverage?: number;
  hits?: number;
  runs?: number;
  rbis?: number;
  homeRuns?: number;
  stolenBases?: number;
  inningsPitched?: number;
  earnedRunAverage?: number;
  strikeouts?: number;
  wins?: number;
  losses?: number;
  
  // Soccer stats
  goals?: number;
  assistsSoccer?: number;
  saves?: number;
  shutouts?: number;
  
  // Volleyball stats
  kills?: number;
  assistsVolleyball?: number;
  blocksVolleyball?: number;
  digs?: number;
  aces?: number;
  
  // Golf stats
  averageScore?: number;
  tournamentWins?: number;
  roundsPlayed?: number;
  lowestRound?: number;
  
  // Cross Country stats
  fastestTime?: string;
  raceWins?: number;
  racesRun?: number;
  averageTime?: string;
  
  // Wrestling stats
  wrestlingWins?: number;
  wrestlingLosses?: number;
  pins?: number;
  technicalFalls?: number;
  majorDecisions?: number;
  
  // Swimming stats
  bestTime?: string;
  eventWins?: number;
  eventsSwum?: number;
  personalRecords?: number;
  
  // General stats
  gamesPlayed?: number;
  minutesPlayed?: number;
}

const AdminAddStats = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<LIAAStatsFormData>({
    playerName: '',
    teamName: '',
    schoolName: '',
    sport: '',
    division: '',
    season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Load schools on component mount
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsData = await getSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error('Error loading schools:', error);
      }
    };
    loadSchools();
  }, []);

  const sportDivisions: { [key: string]: string[] } = {
    'football': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'basketball': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'baseball': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'softball': ['6A', '5A', '4A', '3A', '2A', '1A'],
    'boys-soccer': ['3A', '2A', '1A'],
    'girls-soccer': ['3A', '2A', '1A'],
    'volleyball': ['3A', '2A', '1A'],
    'tennis': ['3A', '2A', '1A'],
    'boys-cross-country': ['3A', '2A', '1A'],
    'girls-cross-country': ['3A', '2A', '1A'],
    'track': ['3A', '2A', '1A'],
    'swimming': ['3A', '2A', '1A'],
    'wrestling': ['3A', '2A', '1A'],
    'field-hockey': ['3A', '2A', '1A'],
    'lacrosse': ['3A', '2A', '1A'],
    'golf-boys': ['3A', '2A', '1A'],
    'golf-girls': ['3A', '2A', '1A'],
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (name.includes('Average') || name.includes('ERA') ? parseFloat(value) : parseInt(value) || undefined)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Clean up the data - remove undefined values and convert empty strings to undefined
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      );

      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        setMessage('LIAA Statistics added successfully!');
        setMessageType('success');
        setFormData({
          playerName: '',
          teamName: '',
          schoolName: '',
          sport: '',
          division: '',
          season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        });
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || 'Failed to add stats'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error: Failed to connect to server');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const renderSportSpecificFields = () => {
    switch (formData.sport) {
      case 'football':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">🏈 Football Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Passing Yards</label>
                <input
                  type="number"
                  name="passingYards"
                  value={formData.passingYards || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Passing TDs</label>
                <input
                  type="number"
                  name="passingTouchdowns"
                  value={formData.passingTouchdowns || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Rushing Yards</label>
                <input
                  type="number"
                  name="rushingYards"
                  value={formData.rushingYards || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Rushing TDs</label>
                <input
                  type="number"
                  name="rushingTouchdowns"
                  value={formData.rushingTouchdowns || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Receiving Yards</label>
                <input
                  type="number"
                  name="receivingYards"
                  value={formData.receivingYards || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Receiving TDs</label>
                <input
                  type="number"
                  name="receivingTouchdowns"
                  value={formData.receivingTouchdowns || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Tackles</label>
                <input
                  type="number"
                  name="tackles"
                  value={formData.tackles || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Interceptions</label>
                <input
                  type="number"
                  name="interceptions"
                  value={formData.interceptions || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Sacks</label>
                <input
                  type="number"
                  name="sacks"
                  value={formData.sacks || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'basketball':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">🏀 Basketball Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Rebounds</label>
                <input
                  type="number"
                  name="rebounds"
                  value={formData.rebounds || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Assists</label>
                <input
                  type="number"
                  name="assists"
                  value={formData.assists || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Steals</label>
                <input
                  type="number"
                  name="steals"
                  value={formData.steals || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Blocks</label>
                <input
                  type="number"
                  name="blocks"
                  value={formData.blocks || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'boys-soccer':
      case 'girls-soccer':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">⚽ Soccer Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Goals</label>
                <input
                  type="number"
                  name="goals"
                  value={formData.goals || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Assists</label>
                <input
                  type="number"
                  name="assistsSoccer"
                  value={formData.assistsSoccer || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Saves</label>
                <input
                  type="number"
                  name="saves"
                  value={formData.saves || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Shutouts</label>
                <input
                  type="number"
                  name="shutouts"
                  value={formData.shutouts || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'volleyball':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">🏐 Volleyball Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Kills</label>
                <input
                  type="number"
                  name="kills"
                  value={formData.kills || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Assists</label>
                <input
                  type="number"
                  name="assistsVolleyball"
                  value={formData.assistsVolleyball || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Blocks</label>
                <input
                  type="number"
                  name="blocksVolleyball"
                  value={formData.blocksVolleyball || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Digs</label>
                <input
                  type="number"
                  name="digs"
                  value={formData.digs || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Aces</label>
                <input
                  type="number"
                  name="aces"
                  value={formData.aces || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'golf-boys':
      case 'golf-girls':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">⛳ Golf Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Average Score</label>
                <input
                  type="number"
                  step="0.1"
                  name="averageScore"
                  value={formData.averageScore || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Tournament Wins</label>
                <input
                  type="number"
                  name="tournamentWins"
                  value={formData.tournamentWins || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Rounds Played</label>
                <input
                  type="number"
                  name="roundsPlayed"
                  value={formData.roundsPlayed || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Lowest Round</label>
                <input
                  type="number"
                  name="lowestRound"
                  value={formData.lowestRound || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'boys-cross-country':
      case 'girls-cross-country':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">🏃‍♂️ Cross Country Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Fastest Time (MM:SS)</label>
                <input
                  type="text"
                  name="fastestTime"
                  value={formData.fastestTime || ''}
                  onChange={handleInputChange}
                  placeholder="16:42"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Race Wins</label>
                <input
                  type="number"
                  name="raceWins"
                  value={formData.raceWins || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Races Run</label>
                <input
                  type="number"
                  name="racesRun"
                  value={formData.racesRun || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Average Time (MM:SS)</label>
                <input
                  type="text"
                  name="averageTime"
                  value={formData.averageTime || ''}
                  onChange={handleInputChange}
                  placeholder="17:15"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'wrestling':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">🤼 Wrestling Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Wins</label>
                <input
                  type="number"
                  name="wrestlingWins"
                  value={formData.wrestlingWins || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Losses</label>
                <input
                  type="number"
                  name="wrestlingLosses"
                  value={formData.wrestlingLosses || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Pins</label>
                <input
                  type="number"
                  name="pins"
                  value={formData.pins || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Technical Falls</label>
                <input
                  type="number"
                  name="technicalFalls"
                  value={formData.technicalFalls || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Major Decisions</label>
                <input
                  type="number"
                  name="majorDecisions"
                  value={formData.majorDecisions || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'swimming':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">🏊‍♂️ Swimming Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Best Time (MM:SS.ms)</label>
                <input
                  type="text"
                  name="bestTime"
                  value={formData.bestTime || ''}
                  onChange={handleInputChange}
                  placeholder="1:45.23"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Event Wins</label>
                <input
                  type="number"
                  name="eventWins"
                  value={formData.eventWins || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Events Swum</label>
                <input
                  type="number"
                  name="eventsSwum"
                  value={formData.eventsSwum || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Personal Records</label>
                <input
                  type="number"
                  name="personalRecords"
                  value={formData.personalRecords || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-700">General Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Games Played</label>
                <input
                  type="number"
                  name="gamesPlayed"
                  value={formData.gamesPlayed || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Minutes Played</label>
                <input
                  type="number"
                  name="minutesPlayed"
                  value={formData.minutesPlayed || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-primary-700 mb-8">Add Player Statistics</h2>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-100 text-green-800' : 
          messageType === 'error' ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sport Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary-700">Select Sport</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { value: 'football', label: 'Football' },
              { value: 'basketball', label: 'Basketball' },
              { value: 'boys-soccer', label: 'Boys Soccer' },
              { value: 'girls-soccer', label: 'Girls Soccer' },
              { value: 'volleyball', label: 'Volleyball' },
              { value: 'golf-boys', label: 'Boys Golf' },
              { value: 'golf-girls', label: 'Girls Golf' },
              { value: 'boys-cross-country', label: 'Boys Cross Country' },
              { value: 'girls-cross-country', label: 'Girls Cross Country' },
              { value: 'wrestling', label: 'Wrestling' },
              { value: 'swimming', label: 'Swimming' },
              { value: 'baseball', label: 'Baseball' },
              { value: 'softball', label: 'Softball' },
              { value: 'tennis', label: 'Tennis' },
              { value: 'track', label: 'Track & Field' },
              { value: 'field-hockey', label: 'Field Hockey' },
              { value: 'lacrosse', label: 'Lacrosse' },
            ].map((sport) => (
              <button
                key={sport.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sport: sport.value }))}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  formData.sport === sport.value
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        {/* Player Information */}
        {formData.sport && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-primary-700">Player Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Player Name *</label>
                <input
                  type="text"
                  name="playerName"
                  value={formData.playerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">School *</label>
                <select
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select School</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.name}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Division *</label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Division</option>
                  {formData.sport && sportDivisions[formData.sport]?.map((division) => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Season *</label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2024-2025"
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sport-specific statistics */}
        {formData.sport && renderSportSpecificFields()}

        {/* Submit Button */}
        {formData.sport && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {loading ? 'Adding Stats...' : 'Add Statistics'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminAddStats;