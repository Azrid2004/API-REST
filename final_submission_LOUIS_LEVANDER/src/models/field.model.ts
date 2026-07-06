export interface NewField {
    name: string,
    location: string
}

export interface Field {
    id: number,
    name: string,
    location: string,
    createdAt: Date,
    updatedAt: Date
}

//DTO

export interface NewFieldDTO {
    name: string,
    location: string
}

export interface FieldDTO {
    id: number,
    name: string,
    location: string,
    createdAt?: string,
    updatedAt?: string
}

//DBO

export interface FieldDBO {
    id: number,
    name: string,
    location: string,
    created_at: string,
    updated_at: string
}