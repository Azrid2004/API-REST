import { NewTeam, NewTeamDTO, Team, TeamDBO, TeamDTO, TeamFullDTO, TeamShortDTO } from "../models/team.model";

export class TeamsMapper{

    static toDBO(team: Team): TeamDBO {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            sport_type: team.sportType,
            players: team.players,
            trainer_id: team.trainerId,
            created_at: team.createdAt.toISOString(),
            updated_at: team.updatedAt.toISOString()
        };
    }

    static toDTO(team: Team): TeamDTO {
        return {
            id: team.id,
            name: team.name,
            description: team.description,
            sportType: team.sportType,
            players: team.players,
            trainerId: team.trainerId,
            createdAt: team.createdAt.toISOString(),
            updatedAt: team.updatedAt.toISOString()
        };
    }

    static fromDBO(dbo: TeamDBO): Team {
        return {
            id: dbo.id,
            name: dbo.name,
            description: dbo.description,
            sportType: dbo.sport_type,
            players: dbo.players,
            trainerId: dbo.trainer_id,
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at)            
        };
    }

    static fromDTO(dto: TeamDTO): Team {
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            sportType: dto.sportType,
            players: dto.players,
            trainerId: dto.trainerId,
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date()
        };
    }

    static fromNewTeamDTO(newDTO: NewTeamDTO): NewTeam {
        return {
            name: newDTO.name,
            description: newDTO.description, 
            sportType: newDTO.sportType
        };
    }

    static toShortDTO(team: Team): TeamShortDTO {
        return {
            id: team.id,
            name: team.name,
            sportType: team.sportType           
        };
    }
}