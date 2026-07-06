import { NextFunction, Response } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "../models/auth.model";
import { generateFakeToken, validateFakeToken } from "../utils/auth";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";
import { ERole, User } from "../models/user.model";

export class AuthService {

    //This middleware function checks if the user is authenticated
    static authorize (req: AuthenticatedRequest, res: Response, next: NextFunction) {
        //retrieve the token
        const token = req.get("authorization");
        if(!token) {
            //no token retrieved
            LoggerService.error('Missing token');
            res.status(401).send({
                error: `Missing token`
            });
            return;
        }

        const username = validateFakeToken(token);
        if(!username) {
            //invalid token
            LoggerService.error('Missing or invalid token');
            res.status(401).send({
                error: `Missing or invalid token`
            });
            return;
        }

        const existingUser: User | undefined = UsersService.getByUsername(username);
        if(!existingUser){
            LoggerService.error('Missing or invalid token');
            res.status(401).send({
                error: `Missing or invalid token`
            });
            return;
        }

        //Include the user in the request
        req.user = existingUser;
        return next();
    }

    //This function verifies the username and password and returns a token if they match
    static login(username: string, password: string): AuthenticatedUser | undefined {
        const userFound = UsersService.getActiveByUsername(username);
        if(!userFound)
            return undefined;

        //Verifies if the password matches
        if(!UsersService.validateUser(password, userFound.password))
            return undefined

        const token = generateFakeToken(username);

        const result: AuthenticatedUser = {
            username: username,
            token: token,
            role: userFound.role
        };
        return result;
    }

    //This middleware function validates if the user is an admin
    static isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const user = req.user;
        if(!user || user.role !== ERole.ADMIN){
            LoggerService.error('User is not an admin');
            res.status(403).send({
                error: `User is not an admin`
            });
            return;
        }
        return next();
    }

    //This middleware function validates if the user is a trainer
    static isTrainer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const user = req.user;
        if(!user || user.role !== ERole.TRAINER){
            LoggerService.error('User is not a trainer');
            res.status(403).send({
                error: `User is not a trainer`
            });
            return;
        }
        return next();
    }

    //This middleware function validates if the user is a referee
    static isReferee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const user = req.user;
        if(!user || user.role !== ERole.REFEREE){
            LoggerService.error('User is not a trainer');
            res.status(403).send({
                error: `User is not a trainer`
            });
            return;
        }
        return next();
    }

    //This middleware function validates if the user is an admin or a referee
    static isAdminOrReferee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const user = req.user;
        if(!user || user.role !== ERole.ADMIN && user.role !== ERole.REFEREE){
            LoggerService.error('User is not a trainer or an admin');
            res.status(403).send({
                error: `User is not a trainer or an admin`
            });
            return;
        }
        return next();
    }

    //This middleware function validates if the user is referee, a trainer or an admin
    static isRefereeTrainerOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const user = req.user;
        if(!user || user.role !== ERole.ADMIN && user.role !== ERole.REFEREE && user.role !== ERole.TRAINER){
            LoggerService.error('User is not a referee, a trainer or an admin');
            res.status(403).send({
                error: `User is not a referee, a trainer or an admin`
            });
            return;
        }
        return next();
    }

}