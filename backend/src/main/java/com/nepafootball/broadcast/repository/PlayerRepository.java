package com.nepafootball.broadcast.repository;

import com.nepafootball.broadcast.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Player entity
 * 
 * Provides data access methods for player operations
 * 
 * @author NEPA Football Team
 */
@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    
    /**
     * Find all active players
     * 
     * @return List of active players
     */
    List<Player> findByIsActiveTrue();
    
    /**
     * Find players by sport
     * 
     * @param sport The sport to search for
     * @return List of players for the specified sport
     */
    List<Player> findBySport(String sport);
    
    /**
     * Find players by position
     * 
     * @param position The position to search for
     * @return List of players with the specified position
     */
    List<Player> findByPosition(String position);
    
    /**
     * Find players by sport and position
     * 
     * @param sport The sport to search for
     * @param position The position to search for
     * @return List of players for the specified sport and position
     */
    List<Player> findBySportAndPosition(String sport, String position);
    
    /**
     * Find players by grade
     * 
     * @param grade The grade to search for
     * @return List of players in the specified grade
     */
    List<Player> findByGrade(String grade);
    
    /**
     * Find players by name containing the given string
     * 
     * @param name The name to search for
     * @return List of players with matching names
     */
    List<Player> findByNameContainingIgnoreCase(String name);
} 