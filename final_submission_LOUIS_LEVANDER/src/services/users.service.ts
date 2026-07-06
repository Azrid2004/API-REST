import { UsersMapper } from "../mappers/user.mapper";
import { ERole, EUserStatus, NewUser, User, UserDBO } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import bcrypt from "bcrypt";

export class UsersService {

    //This function returns true if the database was successfully modified
    private static writeUsersDB(users: User[]): boolean {
        const dbos: UserDBO[] = [];
        for(const user of users){
            dbos.push(UsersMapper.toDBO(user));
        }
        try{
            FilesService.writeFile<UserDBO>('./data/users.json', dbos);
        } catch (error) {
            LoggerService.error(error);
            return false;
        }
        return true;
    }

    
    //This function returns a new ID which will be used to create a user
    private static getNewId(users: User[]): number {
        let maxId = 0;
        if(users.length === 0)
            return 1;
        for(const user of users){
            if(user.id > maxId)
                maxId = user.id;
        }
        return maxId+1;
    }

    //This function returns all users
    private static readUsersDB(): User[]{
        let dbos: UserDBO[] = [];
        try {
            dbos = FilesService.readFile<UserDBO>('./data/users.json');
        } catch (error) {
            LoggerService.error(error);
            return [];
        }
        const users: User[] = [];
        for(const dbo of dbos) {
            users.push(UsersMapper.fromDBO(dbo));
        }
        return users;
    }

    //This function returns true if the password matches
    public static validateUser(password: string, passwordHash: string): boolean {
        return bcrypt.compareSync(password, passwordHash);
    }
    

    //This function returns only active users
    public static getActiveAll(): User[]{
        let dbos: UserDBO[] = [];
        try {
            dbos = FilesService.readFile<UserDBO>('./data/users.json');
        } catch (error) {
            LoggerService.error(error);
            return [];
        }
        const users: User[] = [];
        for(const dbo of dbos) {
            if(dbo.status === 'active'){
                users.push(UsersMapper.fromDBO(dbo));
            }
        }
        return users;
    }

    //This function finds an active user by using their ID
    public static getActiveById(id: number): User | undefined {
        const usersDB: User[] = this.getActiveAll();
        for(const user of usersDB){
            if(user.id === id){
                return user;
            }
        }
        return undefined;
    }

    //This function finds a user by using their ID
    public static getById(id: number): User | undefined {
        const usersDB: User[] = this.readUsersDB();
        for(const user of usersDB){
            if(user.id === id){
                return user;
            }
        }
        return undefined;
    }

    //This function finds a user by using their username
    public static getByUsername(username: string): User | undefined {
        const usersDB: User[] = this.readUsersDB();
        for(const user of usersDB){
            if(user.username === username){
                return user;
            }
        }
        return undefined;
    }

    //This function finds an active user by using their username
    public static getActiveByUsername(username: string): User | undefined {
        const usersDB: User[] = this.getActiveAll();
        for(const user of usersDB){
            if(user.username === username){
                return user;
            }
        }
        return undefined;
    }

    //This function finds a user by using their email
    public static getByEmail(email: string): User | undefined {
        const usersDB: User[] = this.readUsersDB();
        for(const user of usersDB){
            if(user.email === email){
                return user;
            }
        }
        return undefined;
    }

    //This function finds an active user by using their email
    public static getActiveByEmail(email: string): User | undefined {
        const usersDB: User[] = this.getActiveAll();
        for(const user of usersDB){
            if(user.email === email){
                return user;
            }
        }
        return undefined;
    }

    //This function create a new user
    public static create(newUser: NewUser): User | undefined {
        const usersDB: User[] = this.readUsersDB();
        const passwordHash = bcrypt.hashSync(newUser.password, 10);
        const user: User = {               
            id: this.getNewId(usersDB),              
            firstName: newUser.firstName,               
            lastName: newUser.lastName,     
            email: newUser.email,     
            username: newUser.username,            
            password: passwordHash,      
            role: ERole.PLAYER,    
            status: EUserStatus.ACTIVE,             
            createdAt: new Date(),
            updatedAt: new Date()
        };
        usersDB.push(user);
        if(!UsersService.writeUsersDB(usersDB)){
            return undefined;
        }
        return user;
    }

    //Update a user (any authenticated user)
    public static update(user: User): User | undefined {
        const usersDB: User[] = UsersService.readUsersDB();
        let index = -1;
        for(let i = 0; i < usersDB.length; i++){
            if(user.id === usersDB[i].id){
                index = i;
            }
        }
        if(index === -1){
            return undefined;
        }
        user.createdAt = usersDB[index].createdAt;
        user.updatedAt = new Date();
        user.status = usersDB[index].status;
        user.role = usersDB[index].role;
        user.password = usersDB[index].password;
        usersDB[index] = user;
        if(!UsersService.writeUsersDB(usersDB)){
            return undefined;
        }
        return user;
    }

    //This function changes a user's role
    public static updateRole(role: ERole, id: number): User | undefined {
        const usersDB: User[] = UsersService.readUsersDB();
        let index = -1;
        for(let i = 0; i < usersDB.length; i++){
            if(id === usersDB[i].id){
                index = i;
            }
        }
        if(index === -1){
            return undefined;
        }
        usersDB[index].updatedAt = new Date();
        usersDB[index].role = role;
        if(!UsersService.writeUsersDB(usersDB)){
            return undefined;
        }
        return usersDB[index];
    }

    //This function deletes a user by changing their status to inactive
    public static delete(id: number): boolean {
        const usersDB: User[] = this.readUsersDB();
        let index = -1;
        for(let i = 0; i < usersDB.length; i++) {
            if(usersDB[i].id === id){
                index = i;
                break;
            }
        }
        if(index === -1){
            return false;
        }
        usersDB[index].status = EUserStatus.INACTIVE;
        return UsersService.writeUsersDB(usersDB);
    }

    //This function reactivates a user by changing their status to active
    public static reactivate(id: number): boolean {
        const usersDB: User[] = this.readUsersDB();
        let index = -1;
        for(let i = 0; i < usersDB.length; i++) {
            if(usersDB[i].id === id){
                index = i;
                break;
            }
        }
        if(index === -1){
            return false;
        }
        usersDB[index].status = EUserStatus.ACTIVE;
        return UsersService.writeUsersDB(usersDB);
    }
}