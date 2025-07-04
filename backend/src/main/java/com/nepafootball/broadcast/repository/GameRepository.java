package com.nepafootball.broadcast.repository;

import com.nepafootball.broadcast.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Game entity
 * 
 * Provides data access methods for game operations
 * 
 * @author NEPA Football Team
 */
@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    
    /**
     * Find all active games
     * 
     * @return List of active games
     */
    List<Game> findByIsActiveTrue();
    
    /**
     * Find games by sport
     * 
     * @param sport The sport to search for
     * @return List of games for the specified sport
     */
    List<Game> findBySport(String sport);
    
    /**
     * Find games by date
     * 
     * @param date The date to search for
     * @return List of games on the specified date
     */
    List<Game> findByDate(LocalDate date);
    
    /**
     * Find games by sport and date
     * 
     * @param sport The sport to search for
     * @param date The date to search for
     * @return List of games for the specified sport and date
     */
    List<Game> findBySportAndDate(String sport, LocalDate date);
    
    /**
     * Find games by team name (home or away)
     * 
     * @param teamName The team name to search for
     * @return List of games involving the specified team
     */
    List<Game> findByHomeTeamContainingIgnoreCaseOrAwayTeamContainingIgnoreCase(String teamName, String teamName2);
} 