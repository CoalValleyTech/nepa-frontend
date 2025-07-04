package com.nepafootball.broadcast.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Team entity representing football teams in the NEPA region
 * 
 * This entity stores team information including name, school, division,
 * and other relevant details for the football broadcasting platform.
 * 
 * @author NEPA Football Team
 */
@Entity
@Table(name = "teams")
@EntityListeners(AuditingEntityListener.class)
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Team name is required")
    @Size(max = 100, message = "Team name must not exceed 100 characters")
    @Column(name = "team_name", nullable = false)
    private String teamName;

    @NotBlank(message = "School name is required")
    @Size(max = 100, message = "School name must not exceed 100 characters")
    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Size(max = 50, message = "Mascot must not exceed 50 characters")
    @Column(name = "mascot")
    private String mascot;

    @Size(max = 50, message = "Division must not exceed 50 characters")
    @Column(name = "division")
    private String division;

    @Size(max = 100, message = "Conference must not exceed 100 characters")
    @Column(name = "conference")
    private String conference;

    @Size(max = 200, message = "Home field must not exceed 200 characters")
    @Column(name = "home_field")
    private String homeField;

    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city")
    private String city;

    @Size(max = 2, message = "State must be 2 characters")
    @Column(name = "state")
    private String state;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Team() {}

    public Team(String teamName, String schoolName) {
        this.teamName = teamName;
        this.schoolName = schoolName;
    }

    public Team(String teamName, String schoolName, String mascot, String division, String conference) {
        this.teamName = teamName;
        this.schoolName = schoolName;
        this.mascot = mascot;
        this.division = division;
        this.conference = conference;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getMascot() {
        return mascot;
    }

    public void setMascot(String mascot) {
        this.mascot = mascot;
    }

    public String getDivision() {
        return division;
    }

    public void setDivision(String division) {
        this.division = division;
    }

    public String getConference() {
        return conference;
    }

    public void setConference(String conference) {
        this.conference = conference;
    }

    public String getHomeField() {
        return homeField;
    }

    public void setHomeField(String homeField) {
        this.homeField = homeField;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
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
        return "Team{" +
                "id=" + id +
                ", teamName='" + teamName + '\'' +
                ", schoolName='" + schoolName + '\'' +
                ", mascot='" + mascot + '\'' +
                ", division='" + division + '\'' +
                ", conference='" + conference + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", isActive=" + isActive +
                '}';
    }
} 