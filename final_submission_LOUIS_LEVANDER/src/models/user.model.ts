export enum ERole {
    PLAYER = 'player',
    REFEREE = 'referee',
    TRAINER = 'trainer',
    ADMIN = 'admin'
}

export enum EUserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

//to log in as a user
export interface UserLoginDTO {
    username: string;
    password: string;
}

export interface NewUser {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface User{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: ERole;
    status: EUserStatus;
    createdAt: Date;
    updatedAt: Date;
}

//DTO

export interface NewUserDTO{
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface UserDTO{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password?: string;
    role: ERole;
    status: EUserStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserShortDTO{
    id: number;
    firstName: string;
    lastName: string;
}

//DBO

export interface UserDBO{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    role: ERole;
    status: EUserStatus;
    created_at: string;
    updated_at: string;
}