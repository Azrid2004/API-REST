import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsService } from "../services/fields.service";
import { FieldsMapper } from "../mappers/field.mapper";
import { Field, FieldDTO, NewFieldDTO } from "../models/field.model";
import { isFieldDTO, isNewFieldDTO, isNumber } from "../utils/guards";
import { AuthService } from "../services/auth.service";

export const fieldsController = Router();

//List all fields (no auth required)
fieldsController.get('/', (req: Request, res: Response) => {
    LoggerService.info("[GET] /fields/");
    const fields = FieldsService.getAll();

    const fieldsDTO: FieldDTO[]= [];
    for(const field of fields){
        fieldsDTO.push(FieldsMapper.toDTO(field));
    }
    res.status(200).json(fieldsDTO);
});

//Create a new field (admin only)
fieldsController.post('/', AuthService.authorize, AuthService.isAdmin, (req: Request, res: Response) => {
    LoggerService.info('[POST] /fields/');
    const newFieldDTO: NewFieldDTO = req.body;

    if(!isNewFieldDTO(newFieldDTO)) {
        LoggerService.error('Invalid or missing field fields');
        res.status(400).send({
           error: `Invalid or missing field fields`
        });
        return;
    }

    const field: Field | undefined = FieldsService.create(FieldsMapper.fromNewFieldDTO(newFieldDTO));
    if(!field){
        LoggerService.error('Field not created');
        res.status(500).send({ 
           error: `Field not created`
        });
        return;
    }
    res.status(201).json(FieldsMapper.toDTO(field));
});

//Get a field by ID (no auth required)
fieldsController.get('/:id', (req: Request, res: Response) => {
    LoggerService.info("[GET] /fields/:id");
    const id = Number(req.params.id);

    if(!isNumber(id)){
        LoggerService.error('Invalid ID');
        res.status(400).send({
            error: `Invalid ID`
        });
        return;        
    }

    const field: Field | undefined = FieldsService.getById(id);

    if(!field){
        LoggerService.error('Field not found');
        res.status(404).send({
            error: `Field not found`
        });
        return;        
    }
    res.status(200).json(FieldsMapper.toDTO(field));
});

//Update a field (admin only)
fieldsController.put('/:id', AuthService.authorize, AuthService.isAdmin, (req: Request, res: Response) => {
    LoggerService.info('[PUT] /fields/:id');
    const id = Number(req.params.id);
    const fieldDTO: FieldDTO = req.body;

    if(!isNumber(id)){
        LoggerService.error('Invalid ID');
        res.status(400).send({
            error: `Invalid ID`
        });
        return;        
    }
    if(fieldDTO.id !== id){
        LoggerService.error('Body/path ID mismatch');
        res.status(400).send({
            error: `Body/path ID mismatch`
        });
        return;
    }
    if(!isFieldDTO(fieldDTO)){
        LoggerService.error('Req.body does not match FieldDTO model');
        res.status(400).send({
            error: `Req.body does not match FieldDTO model`
        });
        return;        
    }

    const referenceField: Field | undefined = FieldsService.getById(id);
    if(!referenceField){
        LoggerService.error('Field not found');
        res.status(404).send({
            error: `Field not found`
        });
        return;
    }    

    const updatedField: Field | undefined = FieldsService.update(FieldsMapper.fromDTO(fieldDTO));
    if(!updatedField){
        LoggerService.error('Field not updated');
        res.status(500).send({
            error: `Field not updated`
        });
        return;
    }
    res.status(200).json(FieldsMapper.toDTO(updatedField));
});
