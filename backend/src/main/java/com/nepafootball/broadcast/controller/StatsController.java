package com.nepafootball.broadcast.controller;

import com.nepafootball.broadcast.entity.Stats;
import com.nepafootball.broadcast.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for managing player statistics
 * 
 * Provides API endpoints for stats operations
 * 
 * @author NEPA Football Team
 */
@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private StatsService statsService;

    /**
     * Get all stats
     */
    @GetMapping
    public ResponseEntity<List<Stats>> getAllStats() {
        List<Stats> stats = statsService.getAllStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get stats by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Stats> getStatsById(@PathVariable Long id) {
        Optional<Stats> stats = statsService.getStatsById(id);
        return stats.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get stats by sport
     */
    @GetMapping("/sport/{sport}")
    public ResponseEntity<List<Stats>> getStatsBySport(@PathVariable String sport) {
        List<Stats> stats = statsService.getStatsBySport(sport);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get stats by sport and division
     */
    @GetMapping("/sport/{sport}/division/{division}")
    public ResponseEntity<List<Stats>> getStatsBySportAndDivision(
            @PathVariable String sport, 
            @PathVariable String division) {
        List<Stats> stats = statsService.getStatsBySportAndDivision(sport, division);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get stats by team
     */
    @GetMapping("/team/{teamName}")
    public ResponseEntity<List<Stats>> getStatsByTeam(@PathVariable String teamName) {
        List<Stats> stats = statsService.getStatsByTeam(teamName);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get stats by player
     */
    @GetMapping("/player/{playerName}")
    public ResponseEntity<List<Stats>> getStatsByPlayer(@PathVariable String playerName) {
        List<Stats> stats = statsService.getStatsByPlayer(playerName);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get stats by player, sport, and season
     */
    @GetMapping("/player/{playerName}/sport/{sport}/season/{season}")
    public ResponseEntity<Stats> getStatsByPlayerSportAndSeason(
            @PathVariable String playerName,
            @PathVariable String sport,
            @PathVariable String season) {
        Optional<Stats> stats = statsService.getStatsByPlayerSportAndSeason(playerName, sport, season);
        return stats.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get stats by season
     */
    @GetMapping("/season/{season}")
    public ResponseEntity<List<Stats>> getStatsBySeason(@PathVariable String season) {
        List<Stats> stats = statsService.getStatsBySeason(season);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by passing yards
     */
    @GetMapping("/leaders/passing-yards")
    public ResponseEntity<List<Stats>> getTopPassingYards() {
        List<Stats> stats = statsService.getTopPassingYards();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by rushing yards
     */
    @GetMapping("/leaders/rushing-yards")
    public ResponseEntity<List<Stats>> getTopRushingYards() {
        List<Stats> stats = statsService.getTopRushingYards();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by receiving yards
     */
    @GetMapping("/leaders/receiving-yards")
    public ResponseEntity<List<Stats>> getTopReceivingYards() {
        List<Stats> stats = statsService.getTopReceivingYards();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by points
     */
    @GetMapping("/leaders/points")
    public ResponseEntity<List<Stats>> getTopPoints() {
        List<Stats> stats = statsService.getTopPoints();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by rebounds
     */
    @GetMapping("/leaders/rebounds")
    public ResponseEntity<List<Stats>> getTopRebounds() {
        List<Stats> stats = statsService.getTopRebounds();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by assists
     */
    @GetMapping("/leaders/assists")
    public ResponseEntity<List<Stats>> getTopAssists() {
        List<Stats> stats = statsService.getTopAssists();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by batting average
     */
    @GetMapping("/leaders/batting-average")
    public ResponseEntity<List<Stats>> getTopBattingAverage() {
        List<Stats> stats = statsService.getTopBattingAverage();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get top performers by goals
     */
    @GetMapping("/leaders/goals")
    public ResponseEntity<List<Stats>> getTopGoals() {
        List<Stats> stats = statsService.getTopGoals();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get leaderboard for specific sport, division, and stat type
     */
    @GetMapping("/leaderboard/sport/{sport}/division/{division}/stat/{statType}")
    public ResponseEntity<List<Stats>> getLeaderboard(
            @PathVariable String sport,
            @PathVariable String division,
            @PathVariable String statType) {
        List<Stats> stats = statsService.getLeaderboard(sport, division, statType);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all divisions for a sport
     */
    @GetMapping("/divisions/sport/{sport}")
    public ResponseEntity<List<String>> getDivisionsBySport(@PathVariable String sport) {
        List<String> divisions = statsService.getDivisionsBySport(sport);
        return ResponseEntity.ok(divisions);
    }

    /**
     * Get all seasons
     */
    @GetMapping("/seasons")
    public ResponseEntity<List<String>> getAllSeasons() {
        List<String> seasons = statsService.getAllSeasons();
        return ResponseEntity.ok(seasons);
    }

    /**
     * Get all sports
     */
    @GetMapping("/sports")
    public ResponseEntity<List<String>> getAllSports() {
        List<String> sports = statsService.getAllSports();
        return ResponseEntity.ok(sports);
    }

    /**
     * Create new stats
     */
    @PostMapping
    public ResponseEntity<Stats> createStats(@RequestBody Stats stats) {
        try {
            Stats createdStats = statsService.createStats(stats);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update existing stats
     */
    @PutMapping("/{id}")
    public ResponseEntity<Stats> updateStats(@PathVariable Long id, @RequestBody Stats statsDetails) {
        try {
            Stats updatedStats = statsService.updateStats(id, statsDetails);
            if (updatedStats != null) {
                return ResponseEntity.ok(updatedStats);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Soft delete stats
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStats(@PathVariable Long id) {
        boolean deleted = statsService.deleteStats(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Hard delete stats (permanent removal)
     */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> hardDeleteStats(@PathVariable Long id) {
        boolean deleted = statsService.hardDeleteStats(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

