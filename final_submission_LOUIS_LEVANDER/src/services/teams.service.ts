import { TeamsMapper } from "../mappers/team.mapper";
import { NewTeam, Team, TeamDBO } from "../models/team.model";
import { ERole, EUserStatus } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";

export class TeamsService {

    //This function returns true if the database was successfully modified
    private static writeTeamsDB(teams: Team[]): boolean {
        const dbos: TeamDBO[] = [];
        for(const team of teams){
            dbos.push(TeamsMapper.toDBO(team));
        }
        try{
            FilesService.writeFile<TeamDBO>('./data/teams.json', dbos);
        } catch(error) {
            LoggerService.error(error);
            return false;
        }
        return true;
    }

    //This function returns a new ID which will be used to create a team
    private static getNewId(teams: Team[]): number {
        let maxId = 0;
        if(teams.length === 0)
            return 1;
        for(const team of teams){
            if(team.id > maxId)
                maxId = team.id;
        }
        return maxId+1;
    }

    //This function returns all teams
    public static getAll(): Team[]{
        let dbos: TeamDBO[] = [];
        try {
            dbos = FilesService.readFile<TeamDBO>('./data/teams.json');
        } catch (error) {
            LoggerService.error(error);
            return [];
        }
        const teams: Team[] = [];
        for(const dbo of dbos) {
            teams.push(TeamsMapper.fromDBO(dbo));
        }
        return teams;
    }

    //This function finds a team by using the team's id
    public static getById(id: number): Team | undefined {
        const teamsDB: Team[] = this.getAll();
        for(const team of teamsDB){
            if(team.id === id)
                return team;
        }
        return undefined;
    }

    //This function finds the teams the user belongs to
    public static getByUserId(id: number): Team[] {
        const teamsDB: Team[] = this.getAll();
        const teams: Team[] = []; 
        for(const team of teamsDB){
            if(team.trainerId === id)
                teams.push(team);
            for(const playerId of team.players){
                if(playerId === id)
                    teams.push(team);
            }
        }
        return teams;
    }

    //This function finds a team by using the team's name
    public static getByName(name: string): Team | undefined {
        const teamsDB: Team[] = this.getAll();
        for(const team of teamsDB){
            if(team.name === name)
                return team;
        }
        return undefined;
    }

    //This function create a new team
    public static create(newTeam: NewTeam, id: number): Team | undefined {
        const teamsDB: Team[] = this.getAll();
        const team: Team = {
            id: this.getNewId(teamsDB),
            name: newTeam.name,
            description: newTeam.description,
            sportType: newTeam.sportType,
            players: [],
            trainerId: id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        teamsDB.push(team);
        if(!TeamsService.writeTeamsDB(teamsDB)){
            return undefined;
        }
        return team;
    }

    //This function verifies if the team has duplicate players
    public static hasDuplicatePlayers(team: Team): boolean {
        //A set is a collection that eliminates duplicates
        const players = new Set(team.players)
        if(team.players.length !== players.size){
            return true;
        }
        return false;
    }

    //This function verifies if the trainer is among the players
    public static isTrainerAlsoPlayer(team: Team): boolean {
        //A set is a collection that eliminates duplicates
        const players = new Set(team.players)
        players.add(team.trainerId);
        if(team.players.length+1 !== players.size){
            return true;
        }
        return false;
    }

    //Update a team
    public static update(team: Team): Team | undefined {
        const teamsDB: Team[] = this.getAll();
        let index = -1;
        for(let i = 0; i < teamsDB.length; i++){
            if(team.id === teamsDB[i].id)
                index = i;
        }
        if(index === -1)
            return undefined;
        
        team.createdAt = teamsDB[index].createdAt;
        team.updatedAt = new Date();
        team.players = teamsDB[index].players;
        team.trainerId = teamsDB[index].trainerId;
        teamsDB[index] = team;
        if(!TeamsService.writeTeamsDB(teamsDB)){
            return undefined;
        }
        return team;
    }

    //Adds the user to the team's player list
    public static joinTeam(teamId: number, userId: number): Team | undefined {
        const teamsDB: Team[] = this.getAll();
        let index = -1;
        for(let i = 0; i < teamsDB.length; i++){
            if(teamsDB[i].id === teamId){
                index = i;
                break;
            }
        }
        if(index === -1)
            return undefined;

        //verification of duplicate players or trainers
        const team = this.getById(teamId);
        if(!team)
            return undefined;
        team.updatedAt = new Date();
        team.players.push(userId);
        if(this.hasDuplicatePlayers(team) || this.isTrainerAlsoPlayer(team))
            return undefined;

        teamsDB[index] = team;
        if(!TeamsService.writeTeamsDB(teamsDB)){
            return undefined;
        }
        return team;
    }

    //Removes the user from the team's player list
    public static leaveTeam(teamId: number, userId: number): Team | undefined {
        const teamsDB: Team[] = this.getAll();
        let indexTeam = -1;
        for(let i = 0; i < teamsDB.length; i++){
            if(teamsDB[i].id === teamId){
                indexTeam = i;
                break;
            }
        }
        if(indexTeam === -1)
            return undefined;

        //verification: is user in the team ?
        const team = teamsDB[indexTeam];
        let indexPlayer = -1;
        for(let i = 0; i < team.players.length; i++){
            if(userId === team.players[i])
                indexPlayer = i;
        }
        if(indexPlayer === -1)
            return undefined;
        team.players.splice(indexPlayer, 1);
        team.updatedAt = new Date();
        if(!TeamsService.writeTeamsDB(teamsDB)){
            return undefined;
        }
        return team;
    }
}