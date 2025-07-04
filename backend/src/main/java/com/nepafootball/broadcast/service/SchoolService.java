package com.nepafootball.broadcast.service;

import com.nepafootball.broadcast.entity.School;
import com.nepafootball.broadcast.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for School entity operations
 * 
 * Handles business logic for school management
 * 
 * @author NEPA Football Team
 */
@Service
public class SchoolService {
    
    @Autowired
    private SchoolRepository schoolRepository;
    
    /**
     * Get all schools
     * 
     * @return List of all schools
     */
    public List<School> getAllSchools() {
        return schoolRepository.findAll();
    }
    
    /**
     * Get all active schools
     * 
     * @return List of active schools
     */
    public List<School> getActiveSchools() {
        return schoolRepository.findByIsActiveTrue();
    }
    
    /**
     * Get school by ID
     * 
     * @param id The school ID
     * @return Optional containing the school if found
     */
    public Optional<School> getSchoolById(Long id) {
        return schoolRepository.findById(id);
    }
    
    /**
     * Create a new school
     * 
     * @param school The school to create
     * @return The created school
     */
    public School createSchool(School school) {
        school.setIsActive(true);
        return schoolRepository.save(school);
    }
    
    /**
     * Update an existing school
     * 
     * @param id The school ID
     * @param school The updated school data
     * @return The updated school
     * @throws RuntimeException if school not found
     */
    public School updateSchool(Long id, School school) {
        School existingSchool = schoolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
        
        existingSchool.setName(school.getName());
        existingSchool.setLocation(school.getLocation());
        existingSchool.setSports(school.getSports());
        existingSchool.setIsActive(school.getIsActive());
        
        return schoolRepository.save(existingSchool);
    }
    
    /**
     * Delete a school (soft delete by setting isActive to false)
     * 
     * @param id The school ID
     */
    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
        
        school.setIsActive(false);
        schoolRepository.save(school);
    }
    
    /**
     * Find schools by sport
     * 
     * @param sport The sport to search for
     * @return List of schools that offer the specified sport
     */
    public List<School> getSchoolsBySport(String sport) {
        return schoolRepository.findBySportsContaining(sport);
    }
    
    /**
     * Search schools by name
     * 
     * @param name The name to search for
     * @return List of schools with matching names
     */
    public List<School> searchSchoolsByName(String name) {
        return schoolRepository.findByNameContainingIgnoreCase(name);
    }
} 