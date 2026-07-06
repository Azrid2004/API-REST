import { NewUser, NewUserDTO, User, UserDBO, UserDTO, UserShortDTO } from "../models/user.model";

export class UsersMapper{

    static fromDBO(dbo: UserDBO): User{
        return {
            id: dbo.id,
            email: dbo.email,
            firstName: dbo.first_name,
            lastName: dbo.last_name,
            username: dbo.username,
            password: dbo.password,
            role: dbo.role,
            status: dbo.status,
            createdAt: dbo.created_at ? new Date(dbo.created_at) : new Date(),
            updatedAt: dbo.updated_at ? new Date(dbo.updated_at) : new Date()
        };
    }

    static fromDTO(dto: UserDTO): User{
        return {
            id: dto.id,
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            username: dto.username,
            password: dto.password ? dto.password : "",
            role: dto.role,
            status: dto.status,
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date()
        };
    }

    static fromNewUserDTO(newDTO: NewUserDTO): NewUser {
        return {
            firstName: newDTO.firstName,
            lastName: newDTO.lastName,
            email: newDTO.email,
            username: newDTO.username,
            password: newDTO.password
        };
    }
    
    static toDBO(user: User): UserDBO{
        return {
            id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username,
            password: user.password,
            role: user.role,
            status: user.status,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString()
        };
    }

    static toDTO(user: User): UserDTO{
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            // password: user.password,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
            updatedAt: user.updatedAt ? user.updatedAt.toISOString() : undefined
        };
    }

    static toShortDTO(user: User): UserShortDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
        };
    }
}