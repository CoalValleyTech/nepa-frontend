package com.nepafootball.broadcast.controller;

import com.nepafootball.broadcast.entity.School;
import com.nepafootball.broadcast.service.SchoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for School entity operations
 * 
 * Handles HTTP requests for school management
 * 
 * @author NEPA Football Team
 */
@RestController
@RequestMapping("/api/schools")
@CrossOrigin(origins = "*")
public class SchoolController {
    
    @Autowired
    private SchoolService schoolService;
    
    /**
     * Get all schools
     * 
     * @return List of all schools
     */
    @GetMapping
    public List<School> getAllSchools() {
        return schoolService.getAllSchools();
    }
    
    /**
     * Get all active schools
     * 
     * @return List of active schools
     */
    @GetMapping("/active")
    public List<School> getActiveSchools() {
        return schoolService.getActiveSchools();
    }
    
    /**
     * Get school by ID
     * 
     * @param id The school ID
     * @return School if found, 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<School> getSchoolById(@PathVariable Long id) {
        return schoolService.getSchoolById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new school
     * 
     * @param school The school to create
     * @return The created school
     */
    @PostMapping
    public School createSchool(@RequestBody School school) {
        return schoolService.createSchool(school);
    }
    
    /**
     * Update an existing school
     * 
     * @param id The school ID
     * @param school The updated school data
     * @return The updated school, 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<School> updateSchool(@PathVariable Long id, @RequestBody School school) {
        try {
            return ResponseEntity.ok(schoolService.updateSchool(id, school));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete a school (soft delete)
     * 
     * @param id The school ID
     * @return 204 No Content on success, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        try {
            schoolService.deleteSchool(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Find schools by sport
     * 
     * @param sport The sport to search for
     * @return List of schools that offer the specified sport
     */
    @GetMapping("/sport/{sport}")
    public List<School> getSchoolsBySport(@PathVariable String sport) {
        return schoolService.getSchoolsBySport(sport);
    }
    
    /**
     * Search schools by name
     * 
     * @param name The name to search for
     * @return List of schools with matching names
     */
    @GetMapping("/search")
    public List<School> searchSchoolsByName(@RequestParam String name) {
        return schoolService.searchSchoolsByName(name);
    }
} 