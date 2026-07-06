import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { TeamsService } from "../services/teams.service";
import { NewTeamDTO, Team, TeamDTO, TeamFullDTO, TeamShortDTO } from "../models/team.model";
import { TeamsMapper } from "../mappers/team.mapper";
import { isESportType, isNewTeamDTO, isNumber, isTeamDTO } from "../utils/guards";
import { ERole, EUserStatus, User, UserShortDTO } from "../models/user.model";
import { UsersService } from "../services/users.service";
import { UsersMapper } from "../mappers/user.mapper";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";

export const teamsController = Router();

//List all teams (no auth required)
teamsController.get('/', (req: Request, res: Response) => {
    LoggerService.info("[GET] /teams/");
    const teams = TeamsService.getAll();

    const teamsShortDTO: TeamShortDTO[] = [];
    for(const team of teams){
        teamsShortDTO.push(TeamsMapper.toShortDTO(team));
    }
    res.status(200).json(teamsShortDTO);
});

//Create a new team (trainer only)
teamsController.post("/", AuthService.authorize, AuthService.isTrainer, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[POST] /teams/');
    const newTeamDTO: NewTeamDTO = req.body;
    
    const userId = req.user!.id;
    
    if(!isNewTeamDTO(newTeamDTO)){
        LoggerService.error('Invalid or missing team fields');
        res.status(400).send({
           error: `Invalid or missing team fields`
        });
        return;        
    }

    if(TeamsService.getByName(newTeamDTO.name) !== undefined){
        LoggerService.error("The new team's name already exists");
        res.status(400).send({
           error: `This name already exists : ${newTeamDTO.name}`
        });
        return;    
    }

    const team: Team | undefined = TeamsService.create(TeamsMapper.fromNewTeamDTO(newTeamDTO), userId);
    if(!team){
        LoggerService.error('Team not created');
        res.status(500).send({ 
           error: `Team not created`
        });
        return;
    }
    res.status(201).json(TeamsMapper.toDTO(team));
});

//Get the teams the authenticated user belongs to (any authenticated user)
teamsController.get('/own', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info("[GET] /teams/own");
    
    const userId = req.user!.id;
    const teams = TeamsService.getByUserId(userId);

    LoggerService.debug('Building teamsFullDTO');

    const teamsFullDTO: TeamFullDTO[] = [];
    let teamInvalid: boolean = false;
    
    for(const team of teams){
        const trainer: User | undefined = UsersService.getById(team.trainerId);  
        if(!trainer){
            LoggerService.error('Team trainer not found');
            res.status(404).send({ 
                error: `Team trainer not found`
            });
            return;
        }
        if(trainer.status === EUserStatus.INACTIVE)
            teamInvalid = true;
    
        const playersDTO: UserShortDTO[] = [];   
        for(const playerId of team.players){       
            const player = UsersService.getById(playerId);       
            if(player){
                if(player.status === EUserStatus.INACTIVE)
                    teamInvalid = true;
                playersDTO.push(UsersMapper.toShortDTO(player));
            }
        }

        if(teamInvalid)
            continue;
    
        const teamFullDTO: TeamFullDTO = {       
            id: team.id,        
            name: team.name,        
            description: team.description,       
            sportType: team.sportType,        
            players: playersDTO,        
            trainer: UsersMapper.toShortDTO(trainer),        
            createdAt: team.createdAt.toISOString(),        
            updatedAt: team.updatedAt.toISOString()    
        };
        teamsFullDTO.push(teamFullDTO);
    }
    res.status(200).json(teamsFullDTO);
});


//Get a team by ID (no auth required)
teamsController.get('/:id', (req: Request, res: Response) => {
    LoggerService.info("[GET] /teams/:id");
    const id = Number(req.params.id);

    if(!isNumber(id)){
        LoggerService.error('Invalid team ID');
        res.status(400).send({
            error: `Invalid team ID`
        });
        return;        
    }

    const team: Team | undefined = TeamsService.getById(id);
    
    if(!team){
        LoggerService.error('Team not found');
        res.status(404).send({
            error: `Team not found`
        });
        return;        
    }
    res.status(200).json(TeamsMapper.toDTO(team));
});

//Update a team (trainer only)
teamsController.put('/:id', AuthService.authorize, AuthService.isTrainer, (req: Request, res: Response) => {
    LoggerService.info('[PUT] /teams/:id');
    
    const id = Number(req.params.id);
    const teamDTO: TeamDTO = req.body;

    LoggerService.debug("Request verification");
    if(!isNumber(id)){
        LoggerService.error('Invalid team ID');
        res.status(400).send({
            error: `Invalid team ID`
        });
        return;
    }
    if(teamDTO.id !== id){
        LoggerService.error('Body/path ID mismatch');
        res.status(400).send({
            error: `Body/path ID mismatch`
        });
        return;
    }
    if(!isTeamDTO(teamDTO)){
        LoggerService.error('Req.body does not match TeamDTO model');
        res.status(400).send({
            error: `Req.body does not match TeamDTO model`
        });
        return;
    }

    //find the team by ID
    const referenceTeam: Team | undefined = TeamsService.getById(teamDTO.id);
    if(!referenceTeam){
        LoggerService.error('Team not found');
        res.status(404).send({
            error: `Team not found`
        });
        return;
    }

    const team = TeamsMapper.fromDTO(teamDTO);
    const updatedTeam: Team | undefined = TeamsService.update(team);
    if(!updatedTeam){
        LoggerService.error('Team not updated');
        res.status(500).send({
           error: `Team not updated`
        });
        return;
    }
    res.status(200).json(TeamsMapper.toDTO(updatedTeam));
});

//Join a team (any authenticated user)
teamsController.patch('/:id/join', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /teams/:id/join');
    const id = Number(req.params.id);
    
    const userId = req.user!.id;
    
    const referenceTeam: Team | undefined = TeamsService.getById(id);
    if(!referenceTeam){
        LoggerService.error('Team not found');
        res.status(404).send({
           error: `Team not found`
        });
        return;          
    }

    const team: Team | undefined = TeamsService.joinTeam(id, userId);
    if(!team){
        LoggerService.error('User is already in the team');
        res.status(400).send({
            error: `User is already in the team`
        });
        return;
    }
    res.status(200).send(TeamsMapper.toDTO(team));
});

//Leave a team (any authenticated user)
teamsController.patch('/:id/leave', AuthService.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /teams/:id/leave');
    const id = Number(req.params.id);
    
    const userId = req.user!.id;
    
    const referenceTeam: Team | undefined = TeamsService.getById(id);
    if(!referenceTeam){
        LoggerService.error('Team not found');
        res.status(404).send({
           error: `Team not found`
        });
        return;          
    }

    const team: Team | undefined = TeamsService.leaveTeam(id, userId);
    if(!team){
        LoggerService.error('User is not in the team');
        res.status(404).send({
            error: `User is not in the team`
        });
        return;
    }
    res.status(200).send(TeamsMapper.toDTO(team));
});
