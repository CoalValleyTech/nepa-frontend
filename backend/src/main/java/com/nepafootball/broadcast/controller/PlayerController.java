package com.nepafootball.broadcast.controller;

import com.nepafootball.broadcast.entity.Player;
import com.nepafootball.broadcast.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Player entity operations
 * 
 * Handles HTTP requests for player management
 * 
 * @author NEPA Football Team
 */
@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "*")
public class PlayerController {
    
    @Autowired
    private PlayerService playerService;
    
    /**
     * Get all players
     * 
     * @return List of all players
     */
    @GetMapping
    public List<Player> getAllPlayers() {
        return playerService.getAllPlayers();
    }
    
    /**
     * Get all active players
     * 
     * @return List of active players
     */
    @GetMapping("/active")
    public List<Player> getActivePlayers() {
        return playerService.getActivePlayers();
    }
    
    /**
     * Get player by ID
     * 
     * @param id The player ID
     * @return Player if found, 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable Long id) {
        return playerService.getPlayerById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new player
     * 
     * @param player The player to create
     * @return The created player
     */
    @PostMapping
    public Player createPlayer(@RequestBody Player player) {
        return playerService.createPlayer(player);
    }
    
    /**
     * Update an existing player
     * 
     * @param id The player ID
     * @param player The updated player data
     * @return The updated player, 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(@PathVariable Long id, @RequestBody Player player) {
        try {
            return ResponseEntity.ok(playerService.updatePlayer(id, player));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a player (soft delete)
     * 
     * @param id The player ID
     * @return 204 No Content on success, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        try {
            playerService.deletePlayer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Find players by sport
     * 
     * @param sport The sport to search for
     * @return List of players for the specified sport
     */
    @GetMapping("/sport/{sport}")
    public List<Player> getPlayersBySport(@PathVariable String sport) {
        return playerService.getPlayersBySport(sport);
    }
    
    /**
     * Find players by position
     * 
     * @param position The position to search for
     * @return List of players with the specified position
     */
    @GetMapping("/position/{position}")
    public List<Player> getPlayersByPosition(@PathVariable String position) {
        return playerService.getPlayersByPosition(position);
    }
    
    /**
     * Find players by sport and position
     * 
     * @param sport The sport to search for
     * @param position The position to search for
     * @return List of players for the specified sport and position
     */
    @GetMapping("/sport/{sport}/position/{position}")
    public List<Player> getPlayersBySportAndPosition(@PathVariable String sport, @PathVariable String position) {
        return playerService.getPlayersBySportAndPosition(sport, position);
    }
    
    /**
     * Find players by grade
     * 
     * @param grade The grade to search for
     * @return List of players in the specified grade
     */
    @GetMapping("/grade/{grade}")
    public List<Player> getPlayersByGrade(@PathVariable String grade) {
        return playerService.getPlayersByGrade(grade);
    }
    
    /**
     * Search players by name
     * 
     * @param name The name to search for
     * @return List of players with matching names
     */
    @GetMapping("/search")
    public List<Player> searchPlayersByName(@RequestParam String name) {
        return playerService.searchPlayersByName(name);
    }
} 