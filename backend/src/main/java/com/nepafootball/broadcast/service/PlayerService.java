package com.nepafootball.broadcast.service;

import com.nepafootball.broadcast.entity.Player;
import com.nepafootball.broadcast.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for Player entity operations
 * 
 * Handles business logic for player management
 * 
 * @author NEPA Football Team
 */
@Service
public class PlayerService {
    
    @Autowired
    private PlayerRepository playerRepository;
    
    /**
     * Get all players
     * 
     * @return List of all players
     */
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }
    
    /**
     * Get all active players
     * 
     * @return List of active players
     */
    public List<Player> getActivePlayers() {
        return playerRepository.findByIsActiveTrue();
    }
    
    /**
     * Get player by ID
     * 
     * @param id The player ID
     * @return Optional containing the player if found
     */
    public Optional<Player> getPlayerById(Long id) {
        return playerRepository.findById(id);
    }
    
    /**
     * Create a new player
     * 
     * @param player The player to create
     * @return The created player
     */
    public Player createPlayer(Player player) {
        player.setIsActive(true);
        return playerRepository.save(player);
    }
    
    /**
     * Update an existing player
     * 
     * @param id The player ID
     * @param player The updated player data
     * @return The updated player
     * @throws RuntimeException if player not found
     */
    public Player updatePlayer(Long id, Player player) {
        Player existingPlayer = playerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Player not found with id: " + id));
        
        existingPlayer.setName(player.getName());
        existingPlayer.setNumber(player.getNumber());
        existingPlayer.setPosition(player.getPosition());
        existingPlayer.setGrade(player.getGrade());
        existingPlayer.setHeight(player.getHeight());
        existingPlayer.setWeight(player.getWeight());
        existingPlayer.setSport(player.getSport());
        existingPlayer.setIsActive(player.getIsActive());
        
        return playerRepository.save(existingPlayer);
    }
    
    /**
     * Delete a player (soft delete by setting isActive to false)
     * 
     * @param id The player ID
     */
    public void deletePlayer(Long id) {
        Player player = playerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Player not found with id: " + id));
        
        player.setIsActive(false);
        playerRepository.save(player);
    }
    
    /**
     * Find players by sport
     * 
     * @param sport The sport to search for
     * @return List of players for the specified sport
     */
    public List<Player> getPlayersBySport(String sport) {
        return playerRepository.findBySport(sport);
    }
    
    /**
     * Find players by position
     * 
     * @param position The position to search for
     * @return List of players with the specified position
     */
    public List<Player> getPlayersByPosition(String position) {
        return playerRepository.findByPosition(position);
    }
    
    /**
     * Find players by sport and position
     * 
     * @param sport The sport to search for
     * @param position The position to search for
     * @return List of players for the specified sport and position
     */
    public List<Player> getPlayersBySportAndPosition(String sport, String position) {
        return playerRepository.findBySportAndPosition(sport, position);
    }
    
    /**
     * Find players by grade
     * 
     * @param grade The grade to search for
     * @return List of players in the specified grade
     */
    public List<Player> getPlayersByGrade(String grade) {
        return playerRepository.findByGrade(grade);
    }
    
    /**
     * Search players by name
     * 
     * @param name The name to search for
     * @return List of players with matching names
     */
    public List<Player> searchPlayersByName(String name) {
        return playerRepository.findByNameContainingIgnoreCase(name);
    }
} 