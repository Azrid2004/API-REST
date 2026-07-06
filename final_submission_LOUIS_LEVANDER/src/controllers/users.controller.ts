import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { ERole, EUserStatus, NewUserDTO, User, UserDTO, UserShortDTO } from "../models/user.model";
import { UsersMapper } from "../mappers/user.mapper";
import { isNewUserDTO, isNumber, isString, isUserDTO, isUserRole, isValidEmail } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";

export const usersController = Router();

//List all active users (any authenticated user)
usersController.get("/", AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info("[GET] /users/");
    const userRole = req.user!.role;
    
    const users = UsersService.getActiveAll();
    if(userRole === ERole.ADMIN){
        const usersDTO: UserDTO[] = [];
        for(const user of users){
            usersDTO.push(UsersMapper.toDTO(user));
        }
        res.status(200).json(usersDTO);
    } else {
        const usersShortDTO: UserShortDTO[] = [];
        for(const user of users){
            usersShortDTO.push(UsersMapper.toShortDTO(user));
        }
        res.status(200).json(usersShortDTO);
    }
});

//Create a new user (no auth required)
usersController.post("/", (req: Request, res: Response) => {
    LoggerService.info('[POST] /users/');
    const newUserDTO: NewUserDTO = req.body;

    if(!isNewUserDTO(newUserDTO)) {
        LoggerService.error('Invalid or missing user fields');
        res.status(400).send({
           error: `Invalid or missing user fields`
        });
        return;
    }

    LoggerService.debug("Username and email verification");
    if(UsersService.getByUsername(newUserDTO.username) !== undefined){
        LoggerService.error("The new user's username already exists");
        res.status(400).send({
           error: `This username already exists : ${newUserDTO.username}`,
        });
        return;
    }

    if(UsersService.getByEmail(newUserDTO.email) !== undefined){
        LoggerService.error("The new user's email already exists");
        res.status(400).send({
            error: `This email already exists : ${newUserDTO.email}`
        });
        return;
    }

    if(!isValidEmail(newUserDTO.email)){
        LoggerService.error('Invalid email');
        res.status(400).send({
            error: `This email is invalid : ${newUserDTO.email}`
        });
        return;
    }

    const user: User | undefined = UsersService.create(UsersMapper.fromNewUserDTO(newUserDTO));
    if(!user){
        LoggerService.error('User not created');
        res.status(500).send({ 
           error: `User not created`
        });
        return;
    }
    res.status(201).json(UsersMapper.toDTO(user));
});

//Find a user by username (admin or referee only)
usersController.get('/username/:username', AuthService.authorize, AuthService.isAdminOrReferee, (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/username/:username');
    const username = req.params.username;

    if(!isString(username)){
        LoggerService.error('Invalid username');
        res.status(400).send({
            error: `This username is invalid : ${username}`
        });
        return;
    }

    const user: User | undefined = UsersService.getActiveByUsername(username);
    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
            error: `User not found`
        });
        return;
    }
    res.status(200).json(UsersMapper.toDTO(user));
});

//Find a user by email (admin or referee only)
usersController.get('/email/:email', AuthService.authorize, AuthService.isAdminOrReferee, (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/email/:email');
    const email = req.params.email;

    if(!isString(email)){
        LoggerService.error('Invalid email');
        res.status(400).send({
            error: `This email is invalid : ${email}`
        });
        return;
    }

    const user: User | undefined = UsersService.getActiveByEmail(email);
    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
            error: `User not found`
        });
        return;
    }
    res.status(200).json(UsersMapper.toDTO(user));
});

//Get a user by ID (any authenticated user)
usersController.get('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info("[GET] /users/:id");
    const id = Number(req.params.id);

    const userRole = req.user!.role;
    const userId = req.user!.id;

    if(!isNumber(id)){
        LoggerService.error('Invalid ID');
        res.status(400).send({
            error: `Invalid ID`
        });
        return;
    }

    const user: User | undefined = UsersService.getActiveById(id);

    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
            error: `User not found`
        });
        return;
    }

    if(userRole === ERole.ADMIN || userId === id){
        res.status(200).json(UsersMapper.toDTO(user));
    } else {
        res.status(200).json(UsersMapper.toShortDTO(user));
    }
});

//Update a user (any authenticated user)
usersController.put('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PUT] /users/:id');
    
    const userRole = req.user!.role;
    const userId = req.user!.id;
    
    const id = Number(req.params.id);
    const userDTO: UserDTO = req.body;

    LoggerService.debug("Request verification");
    if(!isNumber(id)){
        LoggerService.error('Invalid ID');
        res.status(400).send({
            error: `Invalid ID`
        });
        return;
    }
    if(userDTO.id !== id){
        LoggerService.error('Body/path ID mismatch');
        res.status(400).send({
            error: `Body/path ID mismatch`
        });
        return;
    }
    if(!isUserDTO(userDTO)){
        LoggerService.error('Req.body does not match UserDTO model');
        res.status(400).send({
            error: `Req.body does not match UserDTO model`
        });
        return;
    }

    //Find the user by ID
    const user: User | undefined = UsersService.getActiveById(userDTO.id);
    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
            error: `User not found`
        });
        return;
    }
    if(user.username !== userDTO.username){
        if(UsersService.getByUsername(userDTO.username) !== undefined){
            LoggerService.error("The updated user's username already exists");
            res.status(400).send({
                error: `This username already exists : ${userDTO.username}`
            });
            return;
        }
    }
    if(user.email !== userDTO.email){
        if(UsersService.getByEmail(userDTO.email) !== undefined){
            LoggerService.error("The updated user's email already exists");
            res.status(400).send({
                error: `This email already exists : ${userDTO.email}`
            });
            return;
        }
        if(!isValidEmail(userDTO.email)){     
            LoggerService.error('Invalid email');
            res.status(400).send({      
                error: `This email is invalid : ${userDTO.email}`        
            });
            return;        
        }
    }

    LoggerService.debug("Role verification");
    if(userRole !== ERole.ADMIN && userDTO.id !== userId){
        LoggerService.error('Forbidden access');
            res.status(403).send({
                error: `Authenticated user is not an admin`
            });
            return;
    }

    const updatedUser: User | undefined = UsersService.update(UsersMapper.fromDTO(userDTO))
    if(!updatedUser){
        LoggerService.error('User not updated');
        res.status(500).send({
           error: `User not updated`
        });
        return;
    }
    res.status(200).json(UsersMapper.toDTO(updatedUser));
});

//Soft-delete a user (admin or self)
usersController.delete('/:id', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[DELETE] /users/:id');
    const id = Number(req.params.id);
    
    const userRole = req.user!.role;
    const userId = req.user!.id;
    
    //Find the user by ID
    const user: User | undefined = UsersService.getById(id);

    if(!isNumber(id)){
        LoggerService.error('Invalid ID');
        res.status(400).send({
            error: `Invalid ID`
        });
        return; 
    }

    LoggerService.debug("Role verification");
    if(userRole !== ERole.ADMIN && id !== userId){
        LoggerService.error('User is not an admin');
            res.status(403).send({
                error: `User is not an admin`
            });
            return;
    }
    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
           error: `User not found`
        });
        return;
    }
    if(user.role === ERole.ADMIN){
        LoggerService.error('Attempt to delete an admin account');
        res.status(400).send({
           error: `Attempt to delete an admin account`
        });
        return;
    }
    if(user.status === EUserStatus.INACTIVE){
        LoggerService.error('User is already inactive');
        res.status(400).send({
           error: `User is already inactive`
        });
        return;
    }
    if(!UsersService.delete(id)){
        LoggerService.error('User cannot be deleted');
        res.status(500).send({
            error: `User cannot be deleted`
        });
        return;
    }
    res.status(200).send();
});

//Change a user's role (admin only)
usersController.patch('/:id/role/:role', AuthService.authorize, AuthService.isAdmin, (req: Request, res: Response) => {
    LoggerService.info('[PATCH] /users/:id/role/:role');
    const id = Number(req.params.id);
    const role = req.params.role;

    if(!isNumber(id)){
        LoggerService.error('Invalid ID');
        res.status(400).send({
            error: `Invalid ID`
        });
        return;         
    }
    if(!isUserRole(role)){
        LoggerService.error('Invalid role');
        res.status(400).send({
            error: `Invalid role`
        });
        return; 
    }

    LoggerService.debug("Role verification");
    const user: User | undefined = UsersService.getActiveById(id);
    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
           error: `User not found`
        });
        return;        
    }
    if(user.role !== ERole.PLAYER){
        LoggerService.error('Only users currently holding the player role can be promoted');
        res.status(400).send({
           error: `Only users currently holding the player role can be promoted `
        });
        return;
    }

    LoggerService.debug("Role update phase");
    const updatedUser = UsersService.updateRole(role, id);
    if(!updatedUser){
        LoggerService.error('User not updated');
        res.status(500).send({
           error: `User not updated`
        });
        return;
    }
    res.status(200).json(UsersMapper.toDTO(updatedUser));
});

//Reactivate an inactive user (admin only)
usersController.patch('/:id/reactivate', AuthService.authorize, AuthService.isAdmin, (req: Request, res: Response) => {
    LoggerService.info('[PATCH] /users/:id/reactivate');
    const id = Number(req.params.id);

    const user: User | undefined = UsersService.getById(id);
    if(!user){
        LoggerService.error('User not found');
        res.status(404).send({
           error: `User not found`
        });
        return;        
    }
    if(user.status === EUserStatus.ACTIVE){
        LoggerService.error('User is already active');
        res.status(400).send({
           error: `User is already active`
        });
    }

    if(!UsersService.reactivate(id)){
        LoggerService.error('User not reactivated');
        res.status(500).send({
            error: `User not reactivated`
        });
        return;
    }
    res.status(200).send();
});



