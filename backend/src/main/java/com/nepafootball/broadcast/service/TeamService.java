package com.nepafootball.broadcast.service;

import com.nepafootball.broadcast.entity.Team;
import com.nepafootball.broadcast.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {
    @Autowired
    private TeamRepository teamRepository;

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Optional<Team> getTeamById(Long id) {
        return teamRepository.findById(id);
    }

    public Team createTeam(Team team) {
        return teamRepository.save(team);
    }

    public Team updateTeam(Long id, Team updatedTeam) {
        return teamRepository.findById(id)
            .map(team -> {
                team.setTeamName(updatedTeam.getTeamName());
                team.setSchoolName(updatedTeam.getSchoolName());
                team.setMascot(updatedTeam.getMascot());
                team.setDivision(updatedTeam.getDivision());
                team.setConference(updatedTeam.getConference());
                team.setHomeField(updatedTeam.getHomeField());
                team.setCity(updatedTeam.getCity());
                team.setState(updatedTeam.getState());
                team.setIsActive(updatedTeam.getIsActive());
                return teamRepository.save(team);
            })
            .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }
} 