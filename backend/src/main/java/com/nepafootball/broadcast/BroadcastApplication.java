package com.nepafootball.broadcast;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Spring Boot Application class for NEPA Football Broadcast Backend
 * 
 * This application provides RESTful APIs for:
 * - User authentication and authorization
 * - Game management and live broadcasting
 * - Team and player statistics
 * - Leaderboards and rankings
 * - Schedule management
 * 
 * @author NEPA Football Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing // Enables automatic timestamp management for entities
public class BroadcastApplication {

    /**
     * Main method to start the Spring Boot application
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(BroadcastApplication.class, args);
    }
} 