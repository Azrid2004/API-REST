import { GamesMapper } from "../mappers/game.mapper";
import { EGameStatus, Game, GameDBO, NewGame } from "../models/game.model";
import { NewTeam } from "../models/team.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class GamesService {

    //This function returns true if the database was successfully modified
    private static writeGamesDB(games: Game[]): boolean {
        const dbos: GameDBO[] = [];
        for(const game of games){
            dbos.push(GamesMapper.toDBO(game));
        }
        try{
            FilesService.writeFile<GameDBO>('./data/games.json', dbos);
        } catch (error) {
            LoggerService.error(error);
            return false;
        }
        return true;
    }

    //This function returns a new ID which will be used to create a game
    private static getNewId(games: Game[]): number {
        let maxId = 0;
        if(games.length === 0)
            return 1;
        for(const game of games){
            if(game.id > maxId)
                maxId = game.id;
        }
        return maxId+1;
    }

    //This function returns all games
    static getAll(): Game[]{
        let dbos: GameDBO[] = [];
        try {
            dbos = FilesService.readFile<GameDBO>('./data/games.json');
        } catch (error) {
            LoggerService.error(error);
            return [];
        }
        const games: Game[] = [];
        for(const dbo of dbos){
            games.push(GamesMapper.fromDBO(dbo));
        }
        return games;
    }

    //This function create a new game
    public static create(newGame: NewGame, userId: number): Game | undefined {
        const gamesDB: Game[] = this.getAll();

        let newStatus = EGameStatus.CREATED;
        let newRefereeId = newGame.refereeId;

        if(newGame.fieldId && newGame.scheduledDate)
            newStatus = EGameStatus.SCHEDULED;
        if(!newGame.refereeId){
            newRefereeId = userId;
        }
        const game: Game = {
            id: this.getNewId(gamesDB),
            status: newStatus,
            name: newGame.name,
            fieldId: newGame.fieldId,
            refereeId: newRefereeId,
            homeTeamId: newGame.homeTeamId,
            awayTeamId: newGame.awayTeamId,
            homeScore: 0,
            awayScore: 0,
            scheduledDate: newGame.scheduledDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        gamesDB.push(game);
        if(!GamesService.writeGamesDB(gamesDB)){
            return undefined;
        }
        return game;
    }

    //This function finds a game by using the game's id
    public static getById(id: Number): Game | undefined {
        const gamesDB: Game[] = this.getAll();
        for(const game of gamesDB){
            if(game.id === id)
                return game;
        }
        return undefined;
    }

    //Update a game
    public static update(game: Game): Game | undefined {
         const gamesDB: Game[] = this.getAll(); 
         let index = -1; 
         for(let i = 0; i < gamesDB.length; i++){ 
            if(game.id === gamesDB[i].id){ 
                index = i; break; } 
            } 
        if(index === -1) 
            return undefined;

        if(gamesDB[index].status === EGameStatus.CANCELLED || gamesDB[index].status === EGameStatus.FINISHED) 
            return undefined; 
        
        if(gamesDB[index].status === EGameStatus.STARTED){ 
            game.fieldId = gamesDB[index].fieldId; 
            game.refereeId = gamesDB[index].refereeId;
            game.homeTeamId = gamesDB[index].homeTeamId;
            game.awayTeamId = gamesDB[index].awayTeamId; 
        }
        game.createdAt = gamesDB[index].createdAt; 
        game.updatedAt = new Date(); game.status = gamesDB[index].status; gamesDB[index] = game; 
        if(game.awayScore === undefined) {
            game.awayScore = 0;
        }
        if(game.homeScore === undefined) {
            game.homeScore = 0;
        }

        //if fieldId and scheduledDate are defined then created become scheduled
        if(gamesDB[index].fieldId !== undefined && gamesDB[index].scheduledDate !== undefined && gamesDB[index].status === EGameStatus.CREATED)
             gamesDB[index].status = EGameStatus.SCHEDULED;
        //if fieldId or scheduledDate is undefined then the status become created
        if(gamesDB[index].fieldId === undefined || gamesDB[index].scheduledDate === undefined)
             gamesDB[index].status = EGameStatus.CREATED; 

        if(!GamesService.writeGamesDB(gamesDB)){ 
            return undefined; 
        } 
        return game; 
    }

    //A field cannot be booked twice the same day
    public static isFieldAvailable(updatedGame: Game): boolean {
        const gamesDB: Game[] = this.getAll();

        if(!updatedGame.scheduledDate || !updatedGame.fieldId)
            return true;

        for(const game of gamesDB){
            if(updatedGame.id === game.id)
                continue;

            if(!game.fieldId || !game.scheduledDate)
                continue;

            if(game.status === EGameStatus.CANCELLED || game.status === EGameStatus.FINISHED)
                continue;

            const updatedGameDate = new Date(updatedGame.scheduledDate);
            game.scheduledDate.setHours(0, 0, 0, 0);
            updatedGameDate.setHours(0, 0, 0, 0);

            if(game.fieldId === updatedGame.fieldId && game.scheduledDate.getTime() === updatedGameDate.getTime())
                return false;
        }
        return true;
    }

    //Permanently removes the game from the data base
    public static delete(id: number): boolean {
        const gamesDB: Game[] = this.getAll();        
        let index = -1;    
        for(let i = 0; i < gamesDB.length; i++) {      
            if (gamesDB[i].id === id) {       
                index = i;       
                break;      
            }    
        }    
        if(index === -1) {      
            return false;
        }
        gamesDB.splice(index, 1);
        if(!GamesService.writeGamesDB(gamesDB)){
            return false;
        }
        return true;
    }

    //Update the score of a game
    public static updateScore(id: number, homeScore: number, awayScore: number): Game | undefined {
        const gamesDB: Game[] = this.getAll();
        let index = -1;
        for(let i = 0; i < gamesDB.length; i++){
            if(gamesDB[i].id === id){
                index = i;
                break;
            }
        }
        if(index === -1)
            return undefined;

        gamesDB[index].homeScore = homeScore;
        gamesDB[index].awayScore = awayScore;
        if(!GamesService.writeGamesDB(gamesDB)){
            return undefined;
        }
        return gamesDB[index];
    }

    ////Update the score of a game
    public static updateStatus(id: number, newStatus: EGameStatus): Game | undefined {
        const gamesDB: Game[] = GamesService.getAll();
        let index = -1;
        for(let i = 0; i < gamesDB.length; i++){
            if(id === gamesDB[i].id){
                index = i;
            }
        }
        if(index === -1){
            return undefined;
        }

        //Status transitions
        if(gamesDB[index].status === EGameStatus.CREATED && newStatus === EGameStatus.CANCELLED){
            gamesDB[index].status = newStatus;
        } else if (gamesDB[index].status === EGameStatus.SCHEDULED && newStatus === EGameStatus.STARTED
                    && gamesDB[index].refereeId !== undefined && gamesDB[index].fieldId !== undefined 
                    && gamesDB[index].homeTeamId !== undefined && gamesDB[index].awayTeamId !== undefined
                    && gamesDB[index].homeScore === 0 && gamesDB[index].awayScore === 0) {
            gamesDB[index].status = newStatus;
        } else if (gamesDB[index].status === EGameStatus.SCHEDULED && newStatus === EGameStatus.CANCELLED){
            gamesDB[index].status = newStatus;
        } else if (gamesDB[index].status === EGameStatus.STARTED && newStatus === EGameStatus.FINISHED){
            gamesDB[index].status = newStatus;
        } else {
            return undefined;
        }

        if(!GamesService.writeGamesDB(gamesDB)){
            return undefined;
        }
        return gamesDB[index];
    }

}