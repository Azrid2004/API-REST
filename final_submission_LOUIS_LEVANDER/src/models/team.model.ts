import { User, UserShortDTO } from "./user.model";

export enum ESportType {
    FOOTBALL = 'football',
    BASKETBALL = 'basketball',
    TENNIS = 'tennis',
    VOLLEYBALL = 'volleyball',
    HOCKEY = 'hockey'
}

export interface NewTeam {
    name: string;
    description?: string;
    sportType: ESportType;
}

export interface Team {
    id: number;
    name: string;
    description?: string;
    sportType: ESportType;
    players: number[];
    trainerId: number;
    createdAt: Date;
    updatedAt: Date;
}

//DBO

export interface TeamDBO {
    id: number;
    name: string;
    description?: string;
    sport_type: ESportType;
    players: number[];
    trainer_id: number;
    created_at: string;
    updated_at: string;
}

//DTO

export interface NewTeamDTO {
    name: string;
    description?: string;
    sportType: ESportType;
}

export interface TeamDTO {
    id: number;
    name: string;
    description?: string;
    sportType: ESportType;
    players: number[];
    trainerId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface TeamFullDTO {
    id: number;
    name: string;
    description?: string;
    sportType: ESportType;
    players: UserShortDTO[];
    trainer: UserShortDTO;
    createdAt?: string;
    updatedAt?: string;
}

export interface TeamShortDTO {
    id: number;
    name: string;
    sportType: ESportType;
}