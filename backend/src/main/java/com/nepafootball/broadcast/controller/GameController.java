package com.nepafootball.broadcast.controller;

import com.nepafootball.broadcast.entity.Game;
import com.nepafootball.broadcast.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for Game entity operations
 * 
 * Handles HTTP requests for game management
 * 
 * @author NEPA Football Team
 */
@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {
    
    @Autowired
    private GameService gameService;
    
    /**
     * Get all games
     * 
     * @return List of all games
     */
    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }
    
    /**
     * Get all active games
     * 
     * @return List of active games
     */
    @GetMapping("/active")
    public List<Game> getActiveGames() {
        return gameService.getActiveGames();
    }
    
    /**
     * Get game by ID
     * 
     * @param id The game ID
     * @return Game if found, 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Game> getGameById(@PathVariable Long id) {
        return gameService.getGameById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new game
     * 
     * @param game The game to create
     * @return The created game
     */
    @PostMapping
    public Game createGame(@RequestBody Game game) {
        return gameService.createGame(game);
    }
    
    /**
     * Update an existing game
     * 
     * @param id The game ID
     * @param game The updated game data
     * @return The updated game, 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Game> updateGame(@PathVariable Long id, @RequestBody Game game) {
        try {
            return ResponseEntity.ok(gameService.updateGame(id, game));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a game (soft delete)
     * 
     * @param id The game ID
     * @return 204 No Content on success, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        try {
            gameService.deleteGame(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Find games by sport
     * 
     * @param sport The sport to search for
     * @return List of games for the specified sport
     */
    @GetMapping("/sport/{sport}")
    public List<Game> getGamesBySport(@PathVariable String sport) {
        return gameService.getGamesBySport(sport);
    }
    
    /**
     * Find games by date
     * 
     * @param date The date to search for (YYYY-MM-DD format)
     * @return List of games on the specified date
     */
    @GetMapping("/date/{date}")
    public List<Game> getGamesByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return gameService.getGamesByDate(localDate);
    }
    
    /**
     * Find games by sport and date
     * 
     * @param sport The sport to search for
     * @param date The date to search for (YYYY-MM-DD format)
     * @return List of games for the specified sport and date
     */
    @GetMapping("/sport/{sport}/date/{date}")
    public List<Game> getGamesBySportAndDate(@PathVariable String sport, @PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return gameService.getGamesBySportAndDate(sport, localDate);
    }
    
    /**
     * Find games by team name
     * 
     * @param teamName The team name to search for
     * @return List of games involving the specified team
     */
    @GetMapping("/team/{teamName}")
    public List<Game> getGamesByTeam(@PathVariable String teamName) {
        return gameService.getGamesByTeam(teamName);
    }
} 