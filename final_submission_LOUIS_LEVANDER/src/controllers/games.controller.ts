import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { GamesService } from "../services/games.service";
import { EGameStatus, Game, GameDTO, GameShortDTO, NewGameDTO } from "../models/game.model";
import { GamesMapper } from "../mappers/game.mapper";
import { isEGameStatus, isGameDTO, isNewGameDTO, isNumber } from "../utils/guards";
import { TeamsService } from "../services/teams.service";
import { FieldsService } from "../services/fields.service";
import { UsersService } from "../services/users.service";
import { ERole, EUserStatus } from "../models/user.model";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";

export const gamesController = Router();

//List upcoming and ongoing games (no auth required)
gamesController.get('/', (req: Request, res: Response) => {
    LoggerService.info("[GET] /games/");

    const games = GamesService.getAll();
    const gamesShortDTO: GameShortDTO[] = [];

    const today = new Date();

    for(const game of games){
        if(!game.scheduledDate)
            continue;

        if(game.scheduledDate >= today){
            gamesShortDTO.push(GamesMapper.toShortDTO(game));
        }
    }
    res.status(200).json(gamesShortDTO);
});

//Create a new game (referee only)
gamesController.post('/', AuthService.authorize, AuthService.isReferee, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[POST] /games/');
    const newGameDTO: NewGameDTO = req.body;
    
    const userId = req.user!.id;

    if(!isNewGameDTO(newGameDTO)){
        LoggerService.error('Invalid or missing game fields');
        res.status(400).send({
           error: `Invalid or missing game fields`
        });
        return;
    }

    //Teams and sport verification
    LoggerService.debug('Teams and sport verification');
    const awayTeam = (newGameDTO.awayTeamId !== undefined) ? TeamsService.getById(newGameDTO.awayTeamId) : undefined;
    const homeTeam = (newGameDTO.homeTeamId !== undefined) ? TeamsService.getById(newGameDTO.homeTeamId) : undefined;
    const teamReferee = (newGameDTO.refereeId !== undefined) ? UsersService.getById(newGameDTO.refereeId) : undefined;

    if(newGameDTO.refereeId !== undefined && !teamReferee){             
        LoggerService.error('New referee not found');       
        res.status(400).send({           
            error: `New referee not found`       
        });        
        return;
    }
    if(newGameDTO.refereeId !== undefined && teamReferee){
        if(teamReferee.role !== ERole.REFEREE){             
            LoggerService.error('The new referee does not have the referee role');          
            res.status(400).send({           
                error: `The new referee does not have the referee role`       
            });
            return;
        }     
    }
    if(newGameDTO.awayTeamId !== undefined && !awayTeam){             
        LoggerService.error('New away team not found');       
        res.status(400).send({           
            error: `New away team not found`       
        });        
        return;
    }
    if(newGameDTO.homeTeamId !== undefined && !homeTeam){             
        LoggerService.error('new home team not found');       
        res.status(400).send({           
            error: `New home team not found`       
        });        
        return;
    }
    if(newGameDTO.homeTeamId !== undefined && newGameDTO.awayTeamId !== undefined){
        if(newGameDTO.awayTeamId === newGameDTO.homeTeamId){
            LoggerService.error('Home team and away team cannot be the same');        
            res.status(400).send({               
                error: `Home team and away team cannot be the same`       
            });    
            return;
        }
        if(awayTeam && homeTeam && awayTeam.sportType !== homeTeam.sportType){           
            LoggerService.error('Away/home team sport mismatch');        
            res.status(400).send({               
                error: `Away/home team sport mismatch`       
            });    
            return;
        }
    }

    //Field and scheduledDate verification
    LoggerService.debug('Field and scheduledDate verification');

    if(newGameDTO.fieldId !== undefined && !FieldsService.getById(newGameDTO.fieldId)){
        LoggerService.error('New field not found');       
        res.status(400).send({           
            error: `New field not found`       
        });        
        return;
    }

    const game: Game | undefined = GamesService.create(GamesMapper.fromNewGameDTO(newGameDTO), userId);
    if(!game){
        LoggerService.error('Game not created');
        res.status(500).send({ 
           error: `Game not created`
        });
        return;
    }
    res.status(201).json(GamesMapper.toDTO(game));
});

//Get a game by ID (no auth required)
gamesController.get('/:id', (req: Request, res: Response) => {
    LoggerService.info("[GET] /games/:id");
    const id = Number(req.params.id);

    if(!isNumber(id)){
        LoggerService.error('Invalid game ID');
        res.status(400).send({
            error: `Invalid game ID`
        });
        return;
    }

    const game: Game | undefined = GamesService.getById(id);

    if(!game){
        LoggerService.error('Game not found');
        res.status(404).send({
            error: `Game not found`
        });
        return; 
    }
    res.status(200).json(GamesMapper.toDTO(game));
});

//Update a game (referee only)
gamesController.put('/:id', AuthService.authorize, AuthService.isReferee, (req: Request, res: Response) => {
    LoggerService.info("[PUT] /games/:id");
    const id = Number(req.params.id);
    const gameDTO: GameDTO = req.body;

    LoggerService.debug("Request verification");
    if(!isNumber(id)){
        LoggerService.error('Invalid game ID');
        res.status(400).send({
            error: `Invalid game ID`
        });
        return;
    }
    if(!isGameDTO(gameDTO)){
        LoggerService.error('Req.body does not match GameDTO model');
        res.status(400).send({
            error: `Req.body does not match GameDTO model`
        });
        return;
    }
    if(gameDTO.id !== id){
        LoggerService.error('Body/path ID mismatch');
        res.status(400).send({
            error: `Body/path ID mismatch`
        });
        return;
    }

    //Teams and sport verification
    LoggerService.debug('Teams and sport verification');
    const awayTeam = (gameDTO.awayTeamId !== undefined) ? TeamsService.getById(gameDTO.awayTeamId) : undefined;
    const homeTeam = (gameDTO.homeTeamId !== undefined) ? TeamsService.getById(gameDTO.homeTeamId) : undefined;
    const teamReferee = (gameDTO.refereeId !== undefined) ? UsersService.getById(gameDTO.refereeId) : undefined;

    if(gameDTO.refereeId !== undefined && !teamReferee){             
        LoggerService.error('New referee not found');       
        res.status(404).send({           
            error: `New referee not found`       
        });        
        return;
    }
    if(gameDTO.refereeId !== undefined && teamReferee){
        if(teamReferee.role !== ERole.REFEREE){             
            LoggerService.error('The new referee does not have the referee role');          
            res.status(400).send({           
                error: `The new referee does not have the referee role`       
            });
            return;
        }     
    }
    if(gameDTO.awayTeamId !== undefined && !awayTeam){             
        LoggerService.error('New away team not found');       
        res.status(400).send({           
            error: `New away team not found`       
        });        
        return;
    }
    if(gameDTO.homeTeamId !== undefined && !homeTeam){             
        LoggerService.error('new home team not found');       
        res.status(400).send({           
            error: `New home team not found`       
        });        
        return;
    }
    if(gameDTO.homeTeamId !== undefined && gameDTO.awayTeamId !== undefined){
        if(gameDTO.awayTeamId === gameDTO.homeTeamId){
            LoggerService.error('Home team and away team cannot be the same');        
            res.status(400).send({               
                error: `Home team and away team cannot be the same`       
            });    
            return;
        }
        if(awayTeam && homeTeam && awayTeam.sportType !== homeTeam.sportType){           
            LoggerService.error('Away/home team sport mismatch');        
            res.status(400).send({               
                error: `Away/home team sport mismatch`       
            });    
            return;
        }
    }

    //Field and scheduledDate verification
    LoggerService.debug('Field verification');
    const game = GamesMapper.fromDTO(gameDTO);

    if(gameDTO.fieldId !== undefined && !FieldsService.getById(gameDTO.fieldId)){
        LoggerService.error('New field not found');       
        res.status(404).send({           
            error: `New field not found`       
        });        
        return;
    }

    if(!GamesService.isFieldAvailable(game)){
        LoggerService.error('The field is already booked');       
        res.status(400).send({           
            error: `The field is already booked`       
        });        
        return;
    }

    //find the game by ID
    const referenceGame: Game | undefined = GamesService.getById(id);
    if(!referenceGame){
        LoggerService.error('Game not found');
        res.status(404).send({
            error: `Game not found`
        });
        return;
    }
    if(referenceGame.status === EGameStatus.CANCELLED || referenceGame.status === EGameStatus.FINISHED){
        LoggerService.error('Cancelled/finished games cannot be updated');
        res.status(400).send({
            error: `Cancelled/finished games cannot be updated`
        });
        return;
    }

    const updatedGame: Game | undefined = GamesService.update(game);
    if(!updatedGame){
        LoggerService.error('Game not updated');
        res.status(500).send({
           error: `Game not updated`
        });
        return;
    }
    res.status(200).json(GamesMapper.toDTO(updatedGame));
});

//Delete a game (admin only)
gamesController.delete('/:id', AuthService.authorize, AuthService.isAdmin, (req: Request, res: Response) => {
    LoggerService.info('[DELETE] /games/:id');
    const id = Number(req.params.id);

    const game: Game | undefined = GamesService.getById(id);

    if(!isNumber(id)){
        LoggerService.error('Invalid game ID');
        res.status(400).send({
            error: `Invalid game ID`
        });
        return;  
    }
    if(!game){
        LoggerService.error('Game not found');
        res.status(404).send({
           error: `Game not found`
        });
        return;
    }

    if(!GamesService.delete(id)){
        LoggerService.error('Failed to delete game');
        res.status(500).send({
            error: `Failed to delete game`
        });
        return;
    }
    res.status(204).send();
});

//Set the score of a started game (referee only)
gamesController.patch('/:id/score/:home/:away', AuthService.authorize, AuthService.isReferee, (req: Request, res: Response) => {
    LoggerService.info('[PATCH] /games/:id/score/:home/:away');
    const id = Number(req.params.id);
    const homeScore = Number(req.params.home);
    const awayScore = Number(req.params.away);

    const referenceGame: Game | undefined = GamesService.getById(id);
    if(!isNumber(id)){
        LoggerService.error('Invalid game ID');
        res.status(400).send({
            error: `Invalid game ID`
        });
        return;          
    }
    if(!referenceGame){
        LoggerService.error('Game not found');
        res.status(404).send({
           error: `Game not found`
        });
        return;          
    }
    if(referenceGame.status !== EGameStatus.STARTED){
        LoggerService.error('Game not in started status');
        res.status(400).send({
           error: `Game not in started status`
        });
        return; 
    }
    if(!isNumber(homeScore) || !isNumber(awayScore) || homeScore < 0 || awayScore < 0){
        LoggerService.error('Invalid score values');
        res.status(400).send({
           error: `Invalid score values`
        });
        return; 
    }

    const game: Game | undefined = GamesService.updateScore(id, homeScore, awayScore);
    if(!game){
        LoggerService.error('Score not updated');
        res.status(500).send({
            error: `Score not updated`
        });
        return;
    }
    res.status(200).json(GamesMapper.toDTO(game));
});

//Update the status of a game (referee, trainer, admin)
gamesController.patch('/:id/status/:status', AuthService.authorize, AuthService.isRefereeTrainerOrAdmin, (req: Request, res: Response) => {
    LoggerService.info('[PATCH] /games/:id/status/:status');
    const id = Number(req.params.id);
    const status = req.params.status;

    if(!isNumber(id)){
        LoggerService.error('Invalid game ID');
        res.status(400).send({
            error: `Invalid game ID`
        });
        return; 
    }
    if(!isEGameStatus(status)){
        LoggerService.error('Invalid game status');
        res.status(400).send({
            error: `Invalid game status`
        });
        return;  
    }

    const updatedGame = GamesService.updateStatus(id, status);
    if(!updatedGame){
        LoggerService.error('Disallowed status transition or missing prerequisites for starting');
        res.status(400).send({
           error: `Disallowed status transition or missing prerequisites for starting`
        });
        return;        
    }
    res.status(200).json(GamesMapper.toDTO(updatedGame));
});

