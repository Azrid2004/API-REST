import { Router, Request, Response } from "express";
import { isString } from "../utils/guards";
import { LoggerService } from "../services/logger.service";
import { AuthService } from "../services/auth.service";
import { AuthenticatedUserDTO } from "../models/auth.model";
import { UsersService } from "../services/users.service";

export const authController = Router()

//Log in and obtain an auth token (no auth required)
authController.post('/login', (req: Request, res: Response) => {
    LoggerService.info('[POST] /auth/login');
    const username = req.body.username;
    const password = req.body.password;
    //Trim removes spaces from a string. This line checks if a username or password has been entered.
    if(!isString(username) || !isString(password) || username.trim() === '' || password.trim() === '') {
        LoggerService.error('Missing or empty username / password');
        res.status(400).send({
           error: `Missing or empty username / password`
        });
        return;
    }

    //Verifies the username and password and returns a token if they match
    const authUser = AuthService.login(username, password);
    if(!authUser){
        LoggerService.error('Invalid credentials');
        res.status(401).send({
           error: `Invalid credentials`
        });
        return;
    }

    const authUserDTO: AuthenticatedUserDTO = {
        username: authUser.username,
        token: authUser.token,
        role: authUser.role
    };
    res.status(200).json(authUserDTO);
});