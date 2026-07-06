import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";

export class FieldsMapper{

    static fromDBO(dbo: FieldDBO): Field {
        return {      
            id: dbo.id,
            name: dbo.name,   
            location: dbo.location,  
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at)
        };
    }

    static toDBO(field: Field): FieldDBO {
        return {
            id: field.id,
            name: field.name,  
            location: field.location,
            created_at: field.createdAt.toISOString(),
            updated_at: field.updatedAt.toISOString()
        };
    }

    static toDTO(field: Field): FieldDTO {
        return {     
            id: field.id,
            name: field.name,  
            location: field.location,
            createdAt: field.createdAt.toISOString(),
            updatedAt: field.updatedAt.toISOString()
        };
    }

    static fromNewFieldDTO(newDTO: NewFieldDTO): NewField {
        return {                
            name: newDTO.name,
            location: newDTO.location
        };
    }

    static fromDTO(dto: FieldDTO): Field {
        return {   
            id: dto.id,
            name: dto.name,   
            location: dto.location,  
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date()
        };
    }
}