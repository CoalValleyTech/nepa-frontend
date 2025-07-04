package com.nepafootball.broadcast.service;

import com.nepafootball.broadcast.entity.Game;
import com.nepafootball.broadcast.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Game entity operations
 * 
 * Handles business logic for game management
 * 
 * @author NEPA Football Team
 */
@Service
public class GameService {
    
    @Autowired
    private GameRepository gameRepository;
    
    /**
     * Get all games
     * 
     * @return List of all games
     */
    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }
    
    /**
     * Get all active games
     * 
     * @return List of active games
     */
    public List<Game> getActiveGames() {
        return gameRepository.findByIsActiveTrue();
    }
    
    /**
     * Get game by ID
     * 
     * @param id The game ID
     * @return Optional containing the game if found
     */
    public Optional<Game> getGameById(Long id) {
        return gameRepository.findById(id);
    }
    
    /**
     * Create a new game
     * 
     * @param game The game to create
     * @return The created game
     */
    public Game createGame(Game game) {
        game.setIsActive(true);
        return gameRepository.save(game);
    }
    
    /**
     * Update an existing game
     * 
     * @param id The game ID
     * @param game The updated game data
     * @return The updated game
     * @throws RuntimeException if game not found
     */
    public Game updateGame(Long id, Game game) {
        Game existingGame = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
        
        existingGame.setHomeTeam(game.getHomeTeam());
        existingGame.setAwayTeam(game.getAwayTeam());
        existingGame.setDate(game.getDate());
        existingGame.setTime(game.getTime());
        existingGame.setLocation(game.getLocation());
        existingGame.setSport(game.getSport());
        existingGame.setNotes(game.getNotes());
        existingGame.setIsActive(game.getIsActive());
        
        return gameRepository.save(existingGame);
    }
    
    /**
     * Delete a game (soft delete by setting isActive to false)
     * 
     * @param id The game ID
     */
    public void deleteGame(Long id) {
        Game game = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
        
        game.setIsActive(false);
        gameRepository.save(game);
    }
    
    /**
     * Find games by sport
     * 
     * @param sport The sport to search for
     * @return List of games for the specified sport
     */
    public List<Game> getGamesBySport(String sport) {
        return gameRepository.findBySport(sport);
    }
    
    /**
     * Find games by date
     * 
     * @param date The date to search for
     * @return List of games on the specified date
     */
    public List<Game> getGamesByDate(LocalDate date) {
        return gameRepository.findByDate(date);
    }
    
    /**
     * Find games by sport and date
     * 
     * @param sport The sport to search for
     * @param date The date to search for
     * @return List of games for the specified sport and date
     */
    public List<Game> getGamesBySportAndDate(String sport, LocalDate date) {
        return gameRepository.findBySportAndDate(sport, date);
    }
    
    /**
     * Find games by team name
     * 
     * @param teamName The team name to search for
     * @return List of games involving the specified team
     */
    public List<Game> getGamesByTeam(String teamName) {
        return gameRepository.findByHomeTeamContainingIgnoreCaseOrAwayTeamContainingIgnoreCase(teamName, teamName);
    }
} 