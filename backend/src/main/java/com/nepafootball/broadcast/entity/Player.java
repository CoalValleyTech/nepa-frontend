package com.nepafootball.broadcast.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Player entity representing athletes on team rosters
 * 
 * This entity stores player information including name, number,
 * position, grade, and sport for the NEPA sports platform.
 * 
 * @author NEPA Football Team
 */
@Entity
@Table(name = "players")
@EntityListeners(AuditingEntityListener.class)
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Player name is required")
    @Size(max = 100, message = "Player name must not exceed 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank(message = "Player number is required")
    @Size(max = 10, message = "Player number must not exceed 10 characters")
    @Column(name = "number", nullable = false)
    private String number;

    @NotBlank(message = "Position is required")
    @Size(max = 50, message = "Position must not exceed 50 characters")
    @Column(name = "position", nullable = false)
    private String position;

    @NotBlank(message = "Grade is required")
    @Size(max = 20, message = "Grade must not exceed 20 characters")
    @Column(name = "grade", nullable = false)
    private String grade;

    @Size(max = 20, message = "Height must not exceed 20 characters")
    @Column(name = "height")
    private String height;

    @Size(max = 20, message = "Weight must not exceed 20 characters")
    @Column(name = "weight")
    private String weight;

    @NotBlank(message = "Sport is required")
    @Size(max = 50, message = "Sport must not exceed 50 characters")
    @Column(name = "sport", nullable = false)
    private String sport;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Player() {}

    public Player(String name, String number, String position, String grade, String sport) {
        this.name = name;
        this.number = number;
        this.position = position;
        this.grade = grade;
        this.sport = sport;
    }

    public Player(String name, String number, String position, String grade, String height, String weight, String sport) {
        this.name = name;
        this.number = number;
        this.position = position;
        this.grade = grade;
        this.height = height;
        this.weight = weight;
        this.sport = sport;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Player{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", number='" + number + '\'' +
                ", position='" + position + '\'' +
                ", grade='" + grade + '\'' +
                ", height='" + height + '\'' +
                ", weight='" + weight + '\'' +
                ", sport='" + sport + '\'' +
                ", isActive=" + isActive +
                '}';
    }
} 