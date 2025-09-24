package com.nepafootball.broadcast.service;

import com.nepafootball.broadcast.entity.Stats;
import com.nepafootball.broadcast.repository.StatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for managing player statistics
 * 
 * Provides business logic for stats operations
 * 
 * @author NEPA Football Team
 */
@Service
public class StatsService {

    @Autowired
    private StatsRepository statsRepository;

    /**
     * Get all active stats
     */
    public List<Stats> getAllStats() {
        return statsRepository.findAll().stream()
                .filter(Stats::getIsActive)
                .toList();
    }

    /**
     * Get stats by ID
     */
    public Optional<Stats> getStatsById(Long id) {
        return statsRepository.findById(id)
                .filter(Stats::getIsActive);
    }

    /**
     * Get all stats for a specific sport
     */
    public List<Stats> getStatsBySport(String sport) {
        return statsRepository.findBySportAndIsActiveTrue(sport);
    }

    /**
     * Get all stats for a specific sport and division
     */
    public List<Stats> getStatsBySportAndDivision(String sport, String division) {
        return statsRepository.findBySportAndDivisionAndIsActiveTrue(sport, division);
    }

    /**
     * Get all stats for a specific team
     */
    public List<Stats> getStatsByTeam(String teamName) {
        return statsRepository.findByTeamNameAndIsActiveTrue(teamName);
    }

    /**
     * Get all stats for a specific player
     */
    public List<Stats> getStatsByPlayer(String playerName) {
        return statsRepository.findByPlayerNameAndIsActiveTrue(playerName);
    }

    /**
     * Get stats for a specific player in a specific sport and season
     */
    public Optional<Stats> getStatsByPlayerSportAndSeason(String playerName, String sport, String season) {
        return statsRepository.findByPlayerNameAndSportAndSeasonAndIsActiveTrue(playerName, sport, season);
    }

    /**
     * Get all stats for a specific season
     */
    public List<Stats> getStatsBySeason(String season) {
        return statsRepository.findBySeasonAndIsActiveTrue(season);
    }

    /**
     * Get top performers by passing yards for football
     */
    public List<Stats> getTopPassingYards() {
        return statsRepository.findTopPassingYards();
    }

    /**
     * Get top performers by rushing yards for football
     */
    public List<Stats> getTopRushingYards() {
        return statsRepository.findTopRushingYards();
    }

    /**
     * Get top performers by receiving yards for football
     */
    public List<Stats> getTopReceivingYards() {
        return statsRepository.findTopReceivingYards();
    }

    /**
     * Get top performers by points for basketball
     */
    public List<Stats> getTopPoints() {
        return statsRepository.findTopPoints();
    }

    /**
     * Get top performers by rebounds for basketball
     */
    public List<Stats> getTopRebounds() {
        return statsRepository.findTopRebounds();
    }

    /**
     * Get top performers by assists for basketball
     */
    public List<Stats> getTopAssists() {
        return statsRepository.findTopAssists();
    }

    /**
     * Get top performers by batting average for baseball/softball
     */
    public List<Stats> getTopBattingAverage() {
        return statsRepository.findTopBattingAverage();
    }

    /**
     * Get top performers by goals for soccer
     */
    public List<Stats> getTopGoals() {
        return statsRepository.findTopGoals();
    }

    /**
     * Get all unique divisions for a sport
     */
    public List<String> getDivisionsBySport(String sport) {
        return statsRepository.findDistinctDivisionsBySport(sport);
    }

    /**
     * Get all unique seasons
     */
    public List<String> getAllSeasons() {
        return statsRepository.findDistinctSeasons();
    }

    /**
     * Get all unique sports
     */
    public List<String> getAllSports() {
        return statsRepository.findDistinctSports();
    }

    /**
     * Create new stats
     */
    public Stats createStats(Stats stats) {
        return statsRepository.save(stats);
    }

    /**
     * Update existing stats
     */
    public Stats updateStats(Long id, Stats statsDetails) {
        Optional<Stats> optionalStats = statsRepository.findById(id);
        if (optionalStats.isPresent()) {
            Stats stats = optionalStats.get();
            
            // Update all fields
            stats.setPlayerName(statsDetails.getPlayerName());
            stats.setTeamName(statsDetails.getTeamName());
            stats.setSchoolName(statsDetails.getSchoolName());
            stats.setSport(statsDetails.getSport());
            stats.setDivision(statsDetails.getDivision());
            stats.setSeason(statsDetails.getSeason());
            
            // Update football stats
            stats.setPassingYards(statsDetails.getPassingYards());
            stats.setPassingTouchdowns(statsDetails.getPassingTouchdowns());
            stats.setRushingYards(statsDetails.getRushingYards());
            stats.setRushingTouchdowns(statsDetails.getRushingTouchdowns());
            stats.setReceivingYards(statsDetails.getReceivingYards());
            stats.setReceivingTouchdowns(statsDetails.getReceivingTouchdowns());
            stats.setTackles(statsDetails.getTackles());
            stats.setInterceptions(statsDetails.getInterceptions());
            stats.setSacks(statsDetails.getSacks());
            
            // Update basketball stats
            stats.setPoints(statsDetails.getPoints());
            stats.setRebounds(statsDetails.getRebounds());
            stats.setAssists(statsDetails.getAssists());
            stats.setSteals(statsDetails.getSteals());
            stats.setBlocks(statsDetails.getBlocks());
            stats.setFieldGoalsMade(statsDetails.getFieldGoalsMade());
            stats.setFieldGoalsAttempted(statsDetails.getFieldGoalsAttempted());
            stats.setThreePointersMade(statsDetails.getThreePointersMade());
            stats.setThreePointersAttempted(statsDetails.getThreePointersAttempted());
            stats.setFreeThrowsMade(statsDetails.getFreeThrowsMade());
            stats.setFreeThrowsAttempted(statsDetails.getFreeThrowsAttempted());
            
            // Update baseball/softball stats
            stats.setBattingAverage(statsDetails.getBattingAverage());
            stats.setHits(statsDetails.getHits());
            stats.setRuns(statsDetails.getRuns());
            stats.setRbis(statsDetails.getRbis());
            stats.setHomeRuns(statsDetails.getHomeRuns());
            stats.setStolenBases(statsDetails.getStolenBases());
            stats.setInningsPitched(statsDetails.getInningsPitched());
            stats.setEarnedRunAverage(statsDetails.getEarnedRunAverage());
            stats.setStrikeouts(statsDetails.getStrikeouts());
            stats.setWins(statsDetails.getWins());
            stats.setLosses(statsDetails.getLosses());
            
            // Update soccer stats
            stats.setGoals(statsDetails.getGoals());
            stats.setAssistsSoccer(statsDetails.getAssistsSoccer());
            stats.setSaves(statsDetails.getSaves());
            stats.setShutouts(statsDetails.getShutouts());
            
            // Update general stats
            stats.setGamesPlayed(statsDetails.getGamesPlayed());
            stats.setMinutesPlayed(statsDetails.getMinutesPlayed());
            
            return statsRepository.save(stats);
        }
        return null;
    }

    /**
     * Soft delete stats (set isActive to false)
     */
    public boolean deleteStats(Long id) {
        Optional<Stats> optionalStats = statsRepository.findById(id);
        if (optionalStats.isPresent()) {
            Stats stats = optionalStats.get();
            stats.setIsActive(false);
            statsRepository.save(stats);
            return true;
        }
        return false;
    }

    /**
     * Hard delete stats (permanent removal)
     */
    public boolean hardDeleteStats(Long id) {
        if (statsRepository.existsById(id)) {
            statsRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get leaderboard data for a specific sport and division
     */
    public List<Stats> getLeaderboard(String sport, String division, String statType) {
        List<Stats> stats = getStatsBySportAndDivision(sport, division);
        
        // Sort by the specified stat type
        return stats.stream()
                .sorted((s1, s2) -> {
                    Integer stat1 = getStatValue(s1, statType);
                    Integer stat2 = getStatValue(s2, statType);
                    if (stat1 == null && stat2 == null) return 0;
                    if (stat1 == null) return 1;
                    if (stat2 == null) return -1;
                    return stat2.compareTo(stat1); // Descending order
                })
                .toList();
    }

    /**
     * Helper method to get stat value by stat type
     */
    private Integer getStatValue(Stats stats, String statType) {
        return switch (statType.toLowerCase()) {
            case "passing_yards" -> stats.getPassingYards();
            case "rushing_yards" -> stats.getRushingYards();
            case "receiving_yards" -> stats.getReceivingYards();
            case "points" -> stats.getPoints();
            case "rebounds" -> stats.getRebounds();
            case "assists" -> stats.getAssists();
            case "goals" -> stats.getGoals();
            case "hits" -> stats.getHits();
            case "runs" -> stats.getRuns();
            case "rbis" -> stats.getRbis();
            case "home_runs" -> stats.getHomeRuns();
            case "stolen_bases" -> stats.getStolenBases();
            case "tackles" -> stats.getTackles();
            case "interceptions" -> stats.getInterceptions();
            case "sacks" -> stats.getSacks();
            case "steals" -> stats.getSteals();
            case "blocks" -> stats.getBlocks();
            case "saves" -> stats.getSaves();
            case "shutouts" -> stats.getShutouts();
            case "strikeouts" -> stats.getStrikeouts();
            case "wins" -> stats.getWins();
            case "losses" -> stats.getLosses();
            default -> null;
        };
    }
}

