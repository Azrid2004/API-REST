import { Game, GameDBO, GameDTO, GameShortDTO, NewGame, NewGameDTO } from "../models/game.model";

export class GamesMapper{

    static fromDBO(dbo: GameDBO): Game{
        return {
            id: dbo.id,
            status: dbo.status,
            name: dbo.name,
            fieldId: dbo.field_id,
            refereeId: dbo.referee_id,
            homeTeamId: dbo.home_team_id,
            awayTeamId: dbo.away_team_id,
            homeScore: dbo.home_score,
            awayScore: dbo.away_score,
            scheduledDate: dbo.scheduled_date ? new Date(dbo.scheduled_date) : undefined,
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at)
        };
    }

    static fromDTO(dto: GameDTO): Game {
        return {
            id: dto.id,
            status: dto.status,
            name: dto.name,
            fieldId: dto.fieldId,
            refereeId: dto.refereeId,
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
            homeScore: dto.homeScore,
            awayScore: dto.awayScore,
            scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date()
        };
    }

    static toDBO(game: Game): GameDBO {
        return {
            id: game.id,
            status: game.status,
            name: game.name,
            field_id: game.fieldId,
            referee_id: game.refereeId,
            home_team_id: game.homeTeamId,
            away_team_id: game.awayTeamId,
            home_score: game.homeScore,
            away_score: game.awayScore, 
            scheduled_date: game.scheduledDate ? game.scheduledDate.toISOString() : undefined,
            created_at: game.createdAt.toISOString(),
            updated_at: game.updatedAt.toISOString()
        };
    }

    static toShortDTO(game: Game): GameShortDTO {
        return {
            id: game.id,
            status: game.status,
            name: game.name,
            fieldId: game.fieldId,
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            scheduledDate: game.scheduledDate ? game.scheduledDate.toISOString() : undefined
        };
    }

    static fromNewGameDTO(newDTO: NewGameDTO): NewGame {
        return {        
            name: newDTO.name,
            fieldId: newDTO.fieldId,    
            refereeId: newDTO.refereeId,
            homeTeamId: newDTO.homeTeamId,
            awayTeamId: newDTO.awayTeamId,
            scheduledDate: newDTO.scheduledDate ? new Date(newDTO.scheduledDate) : undefined
        };
    }

    static toDTO(game: Game): GameDTO {
        return {
            id: game.id,
            status: game.status,
            name: game.name,
            fieldId: game.fieldId,
            refereeId: game.refereeId,
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            scheduledDate: game.scheduledDate ? game.scheduledDate.toISOString() : undefined,
            createdAt: game.createdAt.toISOString(),
            updatedAt: game.updatedAt.toISOString()
        };
    }


}