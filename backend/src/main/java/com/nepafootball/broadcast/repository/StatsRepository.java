package com.nepafootball.broadcast.repository;

import com.nepafootball.broadcast.entity.Stats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Stats entity
 * 
 * Provides data access methods for player statistics
 * 
 * @author NEPA Football Team
 */
@Repository
public interface StatsRepository extends JpaRepository<Stats, Long> {

    /**
     * Find all stats for a specific sport
     */
    List<Stats> findBySportAndIsActiveTrue(String sport);

    /**
     * Find all stats for a specific sport and division
     */
    List<Stats> findBySportAndDivisionAndIsActiveTrue(String sport, String division);

    /**
     * Find all stats for a specific team
     */
    List<Stats> findByTeamNameAndIsActiveTrue(String teamName);

    /**
     * Find all stats for a specific player
     */
    List<Stats> findByPlayerNameAndIsActiveTrue(String playerName);

    /**
     * Find stats for a specific player in a specific sport and season
     */
    Optional<Stats> findByPlayerNameAndSportAndSeasonAndIsActiveTrue(String playerName, String sport, String season);

    /**
     * Find all stats for a specific season
     */
    List<Stats> findBySeasonAndIsActiveTrue(String season);

    /**
     * Find top performers by passing yards for football
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = 'football' AND s.passingYards IS NOT NULL AND s.isActive = true ORDER BY s.passingYards DESC")
    List<Stats> findTopPassingYards();

    /**
     * Find top performers by rushing yards for football
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = 'football' AND s.rushingYards IS NOT NULL AND s.isActive = true ORDER BY s.rushingYards DESC")
    List<Stats> findTopRushingYards();

    /**
     * Find top performers by receiving yards for football
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = 'football' AND s.receivingYards IS NOT NULL AND s.isActive = true ORDER BY s.receivingYards DESC")
    List<Stats> findTopReceivingYards();

    /**
     * Find top performers by points for basketball
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = 'basketball' AND s.points IS NOT NULL AND s.isActive = true ORDER BY s.points DESC")
    List<Stats> findTopPoints();

    /**
     * Find top performers by rebounds for basketball
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = 'basketball' AND s.rebounds IS NOT NULL AND s.isActive = true ORDER BY s.rebounds DESC")
    List<Stats> findTopRebounds();

    /**
     * Find top performers by assists for basketball
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = 'basketball' AND s.assists IS NOT NULL AND s.isActive = true ORDER BY s.assists DESC")
    List<Stats> findTopAssists();

    /**
     * Find top performers by batting average for baseball/softball
     */
    @Query("SELECT s FROM Stats s WHERE s.sport IN ('baseball', 'softball') AND s.battingAverage IS NOT NULL AND s.isActive = true ORDER BY s.battingAverage DESC")
    List<Stats> findTopBattingAverage();

    /**
     * Find top performers by goals for soccer
     */
    @Query("SELECT s FROM Stats s WHERE s.sport IN ('boys-soccer', 'girls-soccer') AND s.goals IS NOT NULL AND s.isActive = true ORDER BY s.goals DESC")
    List<Stats> findTopGoals();

    /**
     * Find top performers by a specific stat for a specific sport and division
     */
    @Query("SELECT s FROM Stats s WHERE s.sport = :sport AND s.division = :division AND s.isActive = true ORDER BY :statField DESC")
    List<Stats> findTopPerformersByStat(@Param("sport") String sport, @Param("division") String division, @Param("statField") String statField);

    /**
     * Find all unique divisions for a sport
     */
    @Query("SELECT DISTINCT s.division FROM Stats s WHERE s.sport = :sport AND s.isActive = true")
    List<String> findDistinctDivisionsBySport(@Param("sport") String sport);

    /**
     * Find all unique seasons
     */
    @Query("SELECT DISTINCT s.season FROM Stats s WHERE s.isActive = true ORDER BY s.season DESC")
    List<String> findDistinctSeasons();

    /**
     * Find all unique sports
     */
    @Query("SELECT DISTINCT s.sport FROM Stats s WHERE s.isActive = true ORDER BY s.sport")
    List<String> findDistinctSports();
}

