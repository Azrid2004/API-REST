import { FieldsMapper } from "../mappers/field.mapper";
import { Field, FieldDBO, NewField } from "../models/field.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class FieldsService {

    //This function returns true if the database was successfully modified
    private static writeFieldsDB(fields: Field[]): boolean {
        const dbos: FieldDBO[] = [];
        for(const field of fields){
            dbos.push(FieldsMapper.toDBO(field));
        }
        try {
            FilesService.writeFile<FieldDBO>('./data/fields.json', dbos);
        } catch (error) {
            LoggerService.error(error);
            return false;
        }
        return true;
    }

    //This function returns a new ID which will be used to create a field
    private static getNewId(fields: Field[]): number {
        let maxId = 0;
        if(fields.length === 0)
            return 1;
        for(const field of fields){
            if(field.id > maxId)
                maxId = field.id;
        }
        return maxId+1;
    }

    ////This function returns all fields
    public static getAll(): Field[]{
        let dbos: FieldDBO[] = [];
        try {
            dbos = FilesService.readFile<FieldDBO>('./data/fields.json');
        } catch (error) {
            LoggerService.error(error);
            return [];
        }
        const fields: Field[] = [];
        for(const dbo of dbos) {
            fields.push(FieldsMapper.fromDBO(dbo));
        }
        return fields;
    }

    //This function finds a user by using their ID
    public static getById(id: number): Field | undefined {
        const fieldsDB: Field[] = this.getAll();
        for(const field of fieldsDB){
            if(field.id === id)
                return field;
        }
        return undefined;
    }

    //This function create a new field
    public static create(newField: NewField): Field | undefined {
        const fieldsDB: Field[] = this.getAll();
        const field: Field = {               
            id: this.getNewId(fieldsDB),             
            name: newField.name,
            location: newField.location,       
            createdAt: new Date(),
            updatedAt: new Date()
        };
        fieldsDB.push(field);
        if(!FieldsService.writeFieldsDB(fieldsDB)){
            return undefined;
        }
        return field;
    }

    //Update a field (any authenticated user)
    public static update(field: Field): Field | undefined {
        const fieldsDB: Field[] = FieldsService.getAll();
        let index = -1;
        for(let i = 0; i < fieldsDB.length; i++){
            if(field.id === fieldsDB[i].id){
                index = i;
            }
        }
        if(index === -1){
            return undefined;
        }
        field.createdAt = fieldsDB[index].createdAt;
        field.updatedAt = new Date();
        fieldsDB[index] = field;
        if(!FieldsService.writeFieldsDB(fieldsDB)){
            return undefined;
        }
        return field;
    }

}