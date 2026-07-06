
export enum EGameStatus {
    CREATED = 'created',
    SCHEDULED = 'scheduled',
    STARTED = 'started',
    FINISHED = 'finished',
    CANCELLED = 'cancelled'
}

export interface NewGame {
    name?: string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    scheduledDate?: Date
}

export interface Game {
    id: number,
    status: EGameStatus,
    name?: string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    homeScore?: number,
    awayScore?: number,
    scheduledDate?: Date,
    createdAt: Date,
    updatedAt: Date
}

//DTO

export interface NewGameDTO {
    name?: string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    scheduledDate?: string
}

export interface GameDTO {
    id: number,
    status: EGameStatus,
    name?: string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    homeScore?: number,
    awayScore?: number,
    scheduledDate?: string,
    createdAt?: string,
    updatedAt?: string
}

export interface GameShortDTO {
    id: number,
    status: EGameStatus,
    name?: string,
    fieldId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    scheduledDate?: string
}

//DBO

export interface GameDBO {
    id: number,
    status: EGameStatus,
    name?: string,
    field_id?: number,
    referee_id?: number,
    home_team_id?: number,
    away_team_id?: number,
    home_score?: number,
    away_score?: number,
    scheduled_date?: string,
    created_at: string,
    updated_at: string
}