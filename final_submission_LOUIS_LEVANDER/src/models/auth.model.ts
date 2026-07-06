import { ERole, User } from "./user.model";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
    user?: User;
}

export interface AuthenticatedUser {
    username: string;
    token: string;
    role: ERole;
}

export interface AuthenticatedUserDTO {
    username: string;
    token: string;
    role: ERole;
}

