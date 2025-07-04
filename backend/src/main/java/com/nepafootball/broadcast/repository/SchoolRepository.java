package com.nepafootball.broadcast.repository;

import com.nepafootball.broadcast.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for School entity
 * 
 * Provides data access methods for school operations
 * 
 * @author NEPA Football Team
 */
@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    
    /**
     * Find all active schools
     * 
     * @return List of active schools
     */
    List<School> findByIsActiveTrue();
    
    /**
     * Find schools by sport
     * 
     * @param sport The sport to search for
     * @return List of schools that offer the specified sport
     */
    List<School> findBySportsContaining(String sport);
    
    /**
     * Find schools by name containing the given string
     * 
     * @param name The name to search for
     * @return List of schools with matching names
     */
    List<School> findByNameContainingIgnoreCase(String name);
} 