import Application from "@/app";
import { SocketEvents } from "@/constants/SocketEvent";
import ISocketService from "@/interfaces/ISocketService";
import { IUserService } from "@/interfaces/IUserService";
import { Server, Socket } from "socket.io";
import UserService from "../user/UserService";
import { IGameService } from "@/interfaces/IGameService";
import GameService from "../game/GameService";
import { Game } from "@/entities/Game";
import { IAddPlayerSubmitDTO } from "@/models/games/IAddPlayerSubmitDTO";
import { IRemovePlayerSubmitDTO } from "@/models/games/IRemovePlayerSubmitDTO";
import { IStartGameSubmitDTO } from "@/models/games/IStartGameSubmitDTO";
import { IChangeTimeSubmitDTO } from "@/models/games/IChangeTimeSubmitDTO";
import { IUpdateListPlayerDTO } from "@/models/games/IUpdateListPlayerDTO";

class SocketService implements ISocketService {
  private socketServer: Server;
  private _userService: IUserService;
  private _gameService: IGameService;
  constructor(Application: Application) {
    this.socketServer = Application.socketServer;
    this._userService = UserService.getInstance();
    this._gameService = GameService.getInstance();
    this.initGameService();
  }

  private initGameService = () => {
    this.socketServer.on("connection", this.onSocketConnect);
    // this.initScheduler();
  };

  private onSocketConnect = (socket: Socket) => {
    console.log(`User ${socket.id} connected`);
    socket.on(SocketEvents.ON.USER_VISIT_GAME, (user) => this.onUserVisitGame(socket, user));
    socket.on(SocketEvents.ON.START_GAME, (data: IStartGameSubmitDTO) => this.onStartGame(socket, data));
    socket.on(SocketEvents.ON.CREATE_GAME, (ownerId: string) => this.onCreateGame(socket, ownerId));
    socket.on(SocketEvents.ON.GET_GAME, (gameId: string) => this.onGetGame(socket, gameId));
    socket.on(SocketEvents.ON.ADD_USER_TO_GAME, (data: IAddPlayerSubmitDTO) => this.onAddUserToGame(socket, data));
    socket.on(SocketEvents.ON.UPDATE_USER_OF_GAME, (data: IUpdateListPlayerDTO) => this.onUpdateUserOfGame(socket, data));
    socket.on(SocketEvents.ON.REMOVE_USER_FROM_GAME, (data: IRemovePlayerSubmitDTO) => this.onRemoveUserFromGame(socket, data));
    socket.on(SocketEvents.ON.RESET_GAME, (data: IStartGameSubmitDTO) => this.onResetGame(socket, data));
    socket.on(SocketEvents.ON.CHANGE_TIME, (data: IChangeTimeSubmitDTO) => this.onChangeTime(socket, data));
    socket.on(SocketEvents.ON.OUT_GAME, (gameId: string) => this.onOutGame(socket, gameId));
    socket.on("disconnect", () => this.onDisconnect(socket));
  };

  onUserVisitGame = async (socket: Socket, user: User) => {
    user.socketId = socket.id;
    const addUserResponse = await this._userService.addUser(user);
    if (addUserResponse.isSuccess) {
      console.log(`User ${user.id} visited game`);
      socket.emit(SocketEvents.EMIT.USER_VISIT_GAME_SUCCESS, user);
    } else {
      console.log(`User ${user.id} visit game failed: ${addUserResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.USER_VISIT_GAME_FAILED, addUserResponse);
    }
  };

  onCreateGame = async (socket: Socket, data: string) => {
    const createGameResponse = await this._gameService.createNewGame(data);
    if (createGameResponse.isSuccess) {
      console.log(`User ${socket.id} created game`);
      socket.emit(SocketEvents.EMIT.CREATE_GAME_SUCCESS, createGameResponse);
    } else {
      console.log(`User ${socket.id} create game failed: ${createGameResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.CREATE_GAME_FAILED, createGameResponse);
    }
  };

  onGetGame = async (socket: Socket, gameId: string) => {
    console.log("gameId", gameId);
    const getGameResponse = await this._gameService.getGameById(gameId);
    if (getGameResponse.isSuccess) {
      console.log(`User ${socket.id} get game`);
      socket.emit(SocketEvents.EMIT.GET_GAME_SUCCESS, getGameResponse);
    } else {
      console.log(`User ${socket.id} get game failed: ${getGameResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.GET_GAME_FAILED, getGameResponse);
    }
  };

  onChangeTime = async (socket: Socket, data: IChangeTimeSubmitDTO) => {
    const changeTimeResponse = await this._gameService.changeTimeOfGame(data);
    if (changeTimeResponse.isSuccess) {
      console.log(`User ${socket.id} change time`);
      socket.emit(SocketEvents.EMIT.CHANGE_TIME_SUCCESS, changeTimeResponse);
    } else {
      console.log(`User ${socket.id} change time failed: ${changeTimeResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.CHANGE_TIME_FAILED, changeTimeResponse);
    }
  };

  onAddUserToGame = async (socket: Socket, data: IAddPlayerSubmitDTO) => {
    const addPlayerResponse = await this._gameService.addPlayerToGame(data);
    if (addPlayerResponse.isSuccess) {
      console.log(`User ${socket.id} added to game`);
      socket.emit(SocketEvents.EMIT.ADD_USER_TO_GAME_SUCCESS, addPlayerResponse);
    } else {
      console.log(`User ${socket.id} add to game failed: ${addPlayerResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.ADD_USER_TO_GAME_FAILED, addPlayerResponse);
    }
  };

  onUpdateUserOfGame = async (socket: Socket, data: IUpdateListPlayerDTO) => {
    const updatePlayerResponse = await this._gameService.updateUserOfGame(data);
    if (updatePlayerResponse.isSuccess) {
      console.log(`User ${socket.id} updated in game`);
      socket.emit(SocketEvents.EMIT.UPDATE_USER_OF_GAME_SUCCESS, updatePlayerResponse);
    } else {
      console.log(`User ${socket.id} update in game failed: ${updatePlayerResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.UPDATE_USER_OF_GAME_FAILED, updatePlayerResponse);
    }
  };

  onRemoveUserFromGame = async (socket: Socket, data: IRemovePlayerSubmitDTO) => {
    console.log("data", data);
    const removePlayerResponse = await this._gameService.removePlayerFromGame(data);
    if (removePlayerResponse.isSuccess) {
      console.log(`User ${socket.id} removed from game`);
      socket.emit(SocketEvents.EMIT.REMOVE_USER_FROM_GAME_SUCCESS, removePlayerResponse);
    } else {
      console.log(`User ${socket.id} remove from game failed: ${removePlayerResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.REMOVE_USER_FROM_GAME_FAILED, removePlayerResponse);
    }
  };

  onOutGame = async (socket: Socket, data: string) => {
    const removeGameResponse = await this._gameService.removeGame(data);
    if (removeGameResponse.isSuccess) {
      console.log(`User ${socket.id} out game`);
      socket.emit(SocketEvents.EMIT.OUT_GAME_SUCCESS, removeGameResponse);
    } else {
      console.log(`User ${socket.id} out game failed: ${removeGameResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.OUT_GAME_FAILED, removeGameResponse);
    }
  };

  onStartGame = async (socket: Socket, data: IStartGameSubmitDTO) => {
    const startGameResponse = await this._gameService.startNewGame(data);
    if (startGameResponse.isSuccess) {
      console.log(`User ${socket.id} start game`);
      socket.emit(SocketEvents.EMIT.START_GAME_SUCCESS, startGameResponse);

      const timeInterval = setInterval(async () => {
        const turn = await this._gameService.startTurn(data.gameId);
        socket.emit(SocketEvents.EMIT.START_TURN_SUCCESS, turn);
        if (turn.isSuccess) {
          const check = this._gameService.checkGameCompleted(data.gameId);
          if (check) {
            socket.emit("endGame", "Game is ended");
            clearInterval(timeInterval);
          }
          if ((turn.data as Game).status !== "racing") {
            console.log("Game is ended", turn.data.status);
            clearInterval(timeInterval);
          }
        }
      }, 1000);
    } else {
      console.log(`User ${socket.id} start game failed: ${startGameResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.START_GAME_FAILED, startGameResponse);
    }
  };

  onResetGame = async (socket: Socket, data: IStartGameSubmitDTO) => {
    const resetGameResponse = await this._gameService.resetGame(data);
    if (resetGameResponse.isSuccess) {
      console.log(`User ${socket.id} reset game`);
      socket.emit(SocketEvents.EMIT.RESET_GAME_SUCCESS, resetGameResponse);
    } else {
      console.log(`User ${socket.id} reset game failed: ${resetGameResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.RESET_GAME_FAILED, resetGameResponse);
    }
  };

  onDisconnect = (socket: Socket) => {
    console.log(`User ${socket.id} disconnected`);
  };
}
export default SocketService;
