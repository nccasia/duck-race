import Application from "@/app";
import { SocketEvents } from "@/constants/SocketEvent";
import { Room } from "@/entities/Room";
import { IGameService } from "@/interfaces/IGameService";
import { IMezonClientService } from "@/interfaces/IMezonClientService";
import { IRoomService } from "@/interfaces/IRoomService";
import ISocketService from "@/interfaces/ISocketService";
import { IUserService } from "@/interfaces/IUserService";
import { IBetForDuckDTO } from "@/models/games/IBetForDuckDTO";
import { ICreateGameSubmitDTO } from "@/models/games/ICreateGameSubmitDTO";
import { IAddDuckToRoomDTO } from "@/models/rooms/IAddDuckToRoomDTO";
import { IChangeTimeSubmitDTO } from "@/models/rooms/IChangeTimeSubmitDTO";
import { CreateRoomSubmitDTO } from "@/models/rooms/ICreateRoomSubmitDTO";
import { IJoinRoomSubmitDTO } from "@/models/rooms/IJoinRoomSubmitDTO";
import { IRemoveDuckDTO } from "@/models/rooms/IRemoveDuckDTO";
import { IStartGameSubmitDTO } from "@/models/rooms/IStartGameSubmitDTO";
import { IUpdateListDuckDTO } from "@/models/rooms/IUpdateListDuckDTO";
import { Server, Socket } from "socket.io";
import GameService from "../game/GameService";
import MezonClientService from "../mezon-client/MezonClientService";
import RoomService from "../room/RoomService";
import UserService from "../user/UserService";

class SocketService implements ISocketService {
  private socketServer: Server;
  private _userService: IUserService;
  private _gameService: IGameService;
  private _roomService: IRoomService;
  private _mezonClientService: IMezonClientService;
  constructor(Application: Application) {
    this.socketServer = Application.socketServer;
    this._userService = UserService.getInstance();
    this._gameService = GameService.getInstance();
    this._roomService = RoomService.getInstance();
    this._mezonClientService = MezonClientService.getInstance();
    this.initGameService();
  }

  private initGameService = () => {
    this._mezonClientService.authenticate();
    this.socketServer.on("connection", this.onSocketConnect);
    // this.initScheduler();
  };

  private onSocketConnect = (socket: Socket) => {
    console.log(`User ${socket.id} connected`);
    socket.on(SocketEvents.ON.USER_VISIT_GAME, ({ walletBalance, hashData }) =>
      this.onUserVisitGame(socket, walletBalance, hashData)
    );
    socket.on(SocketEvents.ON.START_GAME, (data: IStartGameSubmitDTO) => this.onStartGame(socket, data));
    socket.on(SocketEvents.ON.ADD_DUCK_TO_ROOM, (data: IAddDuckToRoomDTO) => this.onAddDuckToRoom(socket, data));
    socket.on(SocketEvents.ON.UPDATE_LIST_DUCK_OF_ROOM, (data: IUpdateListDuckDTO) => this.onUpdateListDuckOfRoom(socket, data));
    socket.on(SocketEvents.ON.REMOVE_USER_FROM_GAME, (data: IRemoveDuckDTO) => this.onRemoveDuckOfGame(socket, data));
    socket.on(SocketEvents.ON.CHANGE_TIME, (data: IChangeTimeSubmitDTO) => this.onChangeTime(socket, data));
    socket.on(SocketEvents.ON.CREATE_NEW_GAME, (data: ICreateGameSubmitDTO) => this.onCreateNewGame(socket, data));
    socket.on(SocketEvents.ON.START_BET, (data: IStartGameSubmitDTO) => this.onStartBet(socket, data));
    socket.on(SocketEvents.ON.GET_GAME_BETTORS, (gameId: string) => this.onGetGameBettors(socket, gameId));

    socket.on(SocketEvents.ON.BET_FOR_DUCK, (data: IBetForDuckDTO) => this.onBetForDuck(socket, data));
    socket.on(SocketEvents.ON.CREATE_ROOM, (data: CreateRoomSubmitDTO) => this.onCreateRoom(socket, data));
    socket.on(SocketEvents.ON.GET_LIST_ROOMS, () => this.onGetListRoom(socket));
    socket.on(SocketEvents.ON.JOIN_ROOM, (data: IJoinRoomSubmitDTO) => this.onJoinRoom(socket, data));
    socket.on(SocketEvents.ON.LEFT_ROOM, (data: IJoinRoomSubmitDTO) => this.onLeaveRoom(socket, data));
    socket.on(SocketEvents.ON.CHECK_ROOM_BEFORE_JOIN, (data: IJoinRoomSubmitDTO) => this.onCheckRoomBeforeJoin(socket, data));
    socket.on(SocketEvents.ON.GET_ROOM_INFO, (roomId: string) => this.onGetRoomInfo(socket, roomId));
    socket.on(SocketEvents.ON.GET_MEMBER_OF_ROOM, (roomId: string) => this.onGetMemberOfRoom(socket, roomId));

    socket.on("disconnect", () => this.onDisconnect(socket));
  };

  onUserVisitGame = async (socket: Socket, walletBalance: number, hashData: string) => {
    const hashUserResponse = await this._userService.verifyHashUser(hashData);

    if (!hashUserResponse.isSuccess) {
      socket.emit(SocketEvents.EMIT.USER_VISIT_GAME_FAILED, hashUserResponse);
      return;
    }

    const mezonUser = hashUserResponse?.data as MezonUser;
    const socketUser: User = {
      id: mezonUser.id,
      socketId: socket.id,
      playerName: mezonUser.display_name,
      userName: mezonUser.username,
      wallet: walletBalance,
    };
    const addUserResponse = await this._userService.addUser(socketUser);
    if (addUserResponse.isSuccess) {
      console.log(`User ${mezonUser.mezon_id} visited game`);
      socket.emit(SocketEvents.EMIT.USER_VISIT_GAME_SUCCESS, socketUser);
    } else {
      console.log(`User ${mezonUser.mezon_id} visit game failed: ${addUserResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.USER_VISIT_GAME_FAILED, addUserResponse);
    }
  };

  onCreateRoom = async (socket: Socket, data: CreateRoomSubmitDTO) => {
    const createRoomResponse = await this._roomService.createRoomAsync(data);
    if (createRoomResponse.isSuccess) {
      const createGameResponse = await this._gameService.createNewGame({
        roomId: createRoomResponse.data.roomId,
        userId: data.ownerId,
      });
      if (!createGameResponse.isSuccess) {
        return createGameResponse;
      }
      createRoomResponse.data.currentGame = createGameResponse.data.id;
      console.log(`User with socket id ${socket.id} created room ${createRoomResponse.data.roomId} successfully`);
      const getListRoomResponse = await this._roomService.getListRooms();
      socket.emit(SocketEvents.EMIT.CREATE_ROOM_SUCCESS, createRoomResponse);
      this.socketServer.emit(SocketEvents.EMIT.GET_LIST_ROOMS_SUCCESS, getListRoomResponse);
    } else {
      console.log(`User with socket id ${socket.id} created room failed: ${createRoomResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.CREATE_ROOM_FAILED, createRoomResponse);
    }
  };

  onGetListRoom = async (socket: Socket) => {
    const getListRoomResponse = await this._roomService.getListRooms();
    if (getListRoomResponse.isSuccess) {
      console.log(`User with socket id ${socket.id} get list room successfully`);
      socket.emit(SocketEvents.EMIT.GET_LIST_ROOMS_SUCCESS, getListRoomResponse);
    } else {
      console.log(`User with socket id ${socket.id} get list room failed: ${getListRoomResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.GET_LIST_ROOMS_FAILED, getListRoomResponse);
    }
  };

  onGetRoomInfo = async (socket: Socket, roomId: string) => {
    const getRoomInfoResponse = await this._roomService.getRoomById(roomId);
    if (getRoomInfoResponse.isSuccess) {
      console.log(`User with socket id ${socket.id} get room ${roomId} successfully`);
      const getMemberOfRoomResponse = await this._roomService.getMemberOfRoom(roomId);
      socket.emit(SocketEvents.EMIT.GET_ROOM_INFO_SUCCESS, getRoomInfoResponse);
      socket.emit(SocketEvents.EMIT.GET_MEMBER_OF_ROOM_SUCCESS, getMemberOfRoomResponse);
    } else {
      console.log(`User with socket id ${socket.id} get room ${roomId} failed: ${getRoomInfoResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.GET_ROOM_INFO_FAILED, getRoomInfoResponse);
    }
  };

  onGetMemberOfRoom = async (socket: Socket, roomId: string) => {
    const getMemberOfRoomResponse = await this._roomService.getMemberOfRoom(roomId);
    if (getMemberOfRoomResponse.isSuccess) {
      console.log(`User with socket id ${socket.id} get member of room ${roomId} successfully`);
      socket.emit(SocketEvents.EMIT.GET_MEMBER_OF_ROOM_SUCCESS, getMemberOfRoomResponse);
    } else {
      console.log(
        `User with socket id ${socket.id} get member of room ${roomId} failed: ${getMemberOfRoomResponse.errorMessage}`
      );
      socket.emit(SocketEvents.EMIT.GET_MEMBER_OF_ROOM_FAILED, getMemberOfRoomResponse);
    }
  };

  onCheckRoomBeforeJoin = async (socket: Socket, data: IJoinRoomSubmitDTO) => {
    const checkRoomBeforeJoinResponse = await this._roomService.checkRoomBeforeJoin(data);
    if (checkRoomBeforeJoinResponse.isSuccess) {
      console.log(`User with socket id ${socket.id} check room ${data.roomId} before join successfully`);
      socket.emit(SocketEvents.EMIT.CHECK_ROOM_BEFORE_JOIN_SUCCESS, checkRoomBeforeJoinResponse);
    } else {
      console.log(
        `User with socket id ${socket.id} check room ${data.roomId} before join failed: ${checkRoomBeforeJoinResponse.errorMessage}`
      );
      socket.emit(SocketEvents.EMIT.CHECK_ROOM_BEFORE_JOIN_FAILED, checkRoomBeforeJoinResponse);
    }
  };

  onJoinRoom = async (socket: Socket, data: IJoinRoomSubmitDTO) => {
    const joinRoomResponse = await this._roomService.joinRoom(data);
    if (joinRoomResponse.isSuccess) {
      console.log(`User with socket id ${socket.id} join room ${data.roomId} successfully`);
      socket.join(data.roomId);
      socket.emit(SocketEvents.EMIT.JOIN_ROOM_SUCCESS, joinRoomResponse);
      const getMemberOfRoomResponse = await this._roomService.getMemberOfRoom(data.roomId);
      this.socketServer.to(data.roomId).emit(SocketEvents.EMIT.GET_MEMBER_OF_ROOM_SUCCESS, getMemberOfRoomResponse);
    } else {
      console.log(`User with socket id ${socket.id} join room failed: ${joinRoomResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.JOIN_ROOM_FAILED, joinRoomResponse);
    }
  };

  onLeaveRoom = async (socket: Socket, data: IJoinRoomSubmitDTO) => {
    const leaveRoomResponse = await this._roomService.leaveRoom(data);
    if (leaveRoomResponse.isSuccess) {
      console.log(`User with socket id ${socket.id} left room ${data.roomId} successfully`);
      const roomData = leaveRoomResponse.data as Room;
      if (!roomData) return;
      socket.leave(roomData.roomId);
      socket.emit(SocketEvents.EMIT.LEFT_ROOM_SUCCESS, leaveRoomResponse);
      const getMemberOfRoomResponse = await this._roomService.getMemberOfRoom(roomData.roomId);
      this.socketServer.to(roomData.roomId).emit(SocketEvents.EMIT.GET_MEMBER_OF_ROOM_SUCCESS, getMemberOfRoomResponse);
      this.socketServer.to(roomData.roomId).emit(SocketEvents.EMIT.USER_LEFT_ROOM, {
        statusCode: 200,
        isSuccess: true,
        errorMessage: "User leave room successfully",
        data: {
          userId: data.userId,
          roomInfo: leaveRoomResponse.data as Room,
        },
      });
    } else {
      console.log(`User with socket id ${socket.id} left room failed: ${leaveRoomResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.LEFT_ROOM_FAILED, leaveRoomResponse);
    }
  };

  onChangeTime = async (socket: Socket, data: IChangeTimeSubmitDTO) => {
    const changeTimeResponse = await this._roomService.changeTimeOfGame(data);
    if (changeTimeResponse.isSuccess) {
      console.log(`User ${socket.id} change time`);
      this.socketServer.to(changeTimeResponse.data.roomId).emit(SocketEvents.EMIT.CHANGE_TIME_SUCCESS, changeTimeResponse);
    } else {
      console.log(`User ${socket.id} change time failed: ${changeTimeResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.CHANGE_TIME_FAILED, changeTimeResponse);
    }
  };

  onAddDuckToRoom = async (socket: Socket, data: IAddDuckToRoomDTO) => {
    const addDuckToRoom = await this._roomService.addDuckToRoom(data);
    if (addDuckToRoom.isSuccess) {
      socket.emit(SocketEvents.EMIT.ADD_DUCK_TO_ROOM_SUCCESS, addDuckToRoom);
      const getDucksOfRoomResponse = await this._roomService.getDucksOfRoom(addDuckToRoom.data.roomId);
      this.socketServer.to(addDuckToRoom.data.roomId).emit(SocketEvents.EMIT.GET_DUCKS_OF_ROOM_SUCCESS, getDucksOfRoomResponse);
    } else {
      console.log(`User ${socket.id} add to game failed: ${addDuckToRoom.errorMessage}`);
      socket.emit(SocketEvents.EMIT.ADD_DUCK_TO_ROOM_FAILED, addDuckToRoom);
    }
  };

  onGetDucksOfRoom = async (socket: Socket, roomId: string) => {
    const getDucksOfRoomResponse = await this._roomService.getDucksOfRoom(roomId);
    if (getDucksOfRoomResponse.isSuccess) {
      console.log(`User ${socket.id} get ducks of room`);
      socket.emit(SocketEvents.EMIT.GET_DUCKS_OF_ROOM_SUCCESS, getDucksOfRoomResponse);
    } else {
      console.log(`User ${socket.id} get ducks of room failed: ${getDucksOfRoomResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.GET_DUCKS_OF_ROOM_FAILED, getDucksOfRoomResponse);
    }
  };

  onUpdateListDuckOfRoom = async (socket: Socket, data: IUpdateListDuckDTO) => {
    const updatePlayerResponse = await this._roomService.updateListDuckOfRoom(data);
    if (updatePlayerResponse.isSuccess) {
      console.log(`User ${socket.id} updated in game`);
      this.socketServer
        .to(updatePlayerResponse.data.roomId)
        .emit(SocketEvents.EMIT.UPDATE_LIST_DUCK_OF_ROOM_SUCCESS, updatePlayerResponse);
    } else {
      console.log(`User ${socket.id} update in game failed: ${updatePlayerResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.UPDATE_LIST_DUCK_OF_ROOM_FAILED, updatePlayerResponse);
    }
  };

  onRemoveDuckOfGame = async (socket: Socket, data: IRemoveDuckDTO) => {
    const removePlayerResponse = await this._roomService.removeDuckFromRoom(data);
    if (removePlayerResponse.isSuccess) {
      console.log(`User ${socket.id} removed from game`);
      this.socketServer
        .to(removePlayerResponse.data.roomId)
        .emit(SocketEvents.EMIT.REMOVE_USER_FROM_GAME_SUCCESS, removePlayerResponse);
    } else {
      console.log(`User ${socket.id} remove from game failed: ${removePlayerResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.REMOVE_USER_FROM_GAME_FAILED, removePlayerResponse);
    }
  };

  onStartGame = async (socket: Socket, data: IStartGameSubmitDTO) => {
    const startGameResponse = await this._roomService.startNewGame(data);
    if (startGameResponse.isSuccess) {
      console.log(`User ${socket.id} start game`);
      this.socketServer.to(startGameResponse.data.roomId).emit(SocketEvents.EMIT.START_GAME_SUCCESS, startGameResponse);

      const timeInterval = setInterval(async () => {
        try {
          const turn = await this._roomService.startTurn(data.roomId);
          this.socketServer.to(startGameResponse.data.roomId).emit(SocketEvents.EMIT.START_TURN_SUCCESS, turn);
          if (turn.isSuccess) {
            const check = this._roomService.checkGameCompleted(data.roomId);
            if (check) {
              const endGameResponse = await this._gameService.endGame(data.gameId);
              console.log("endGameResponse", endGameResponse);
              if (endGameResponse.isSuccess) {
                const dataEmit = {
                  winners: endGameResponse.data.winners,
                  gameId: data.gameId,
                  totalBet: endGameResponse.data.totalBet,
                  winBet:
                    endGameResponse.data.winners.length > 0
                      ? endGameResponse.data.totalBet / endGameResponse.data.winners.length
                      : endGameResponse.data.totalBet / (endGameResponse.data.bettors.length || 1),
                  bettors: endGameResponse.data.bettors,
                };
                this.socketServer.to(data.roomId).emit(SocketEvents.EMIT.END_GAME_SUCCESS, dataEmit);
              }
              clearInterval(timeInterval);
            }
          }
        } catch (error) {
          console.error("Error in game loop:", error);
          clearInterval(timeInterval);
        }
      }, 1000);
    } else {
      console.log(`User ${socket.id} start game failed: ${startGameResponse.errorMessage}`);
      this.socketServer.to(startGameResponse.data.roomId).emit(SocketEvents.EMIT.START_GAME_FAILED, startGameResponse);
    }
  };

  onCreateNewGame = async (socket: Socket, data: ICreateGameSubmitDTO) => {
    const createGameResponse = await this._gameService.createNewGame(data);
    if (createGameResponse.isSuccess) {
      console.log(`User ${socket.id} created new game`);
      const dataResetGame: IStartGameSubmitDTO = {
        roomId: data.roomId,
        userId: data.userId,
        gameId: createGameResponse?.data?.id,
        currentGame: createGameResponse?.data?.id,
      };
      const resetGameResponse = await this._roomService.resetGame(dataResetGame);
      this.socketServer.to(data.roomId).emit(SocketEvents.EMIT.CREATE_NEW_GAME_SUCCESS, resetGameResponse);
    } else {
      console.log(`User ${socket.id} create new game failed: ${createGameResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.CREATE_NEW_GAME_FAILED, createGameResponse);
    }
  };

  onStartBet = async (socket: Socket, data: IStartGameSubmitDTO) => {
    if (!data.roomId) {
      console.log(`User ${socket.id} start bet failed: gameId is required`);
      socket.emit(SocketEvents.EMIT.START_BET_FAILED, { errorMessage: "gameId is required" });
      return;
    }
    const startBetResponse = await this._roomService.startBet(data.roomId);
    if (startBetResponse.isSuccess) {
      this.socketServer.to(data.roomId).emit(SocketEvents.EMIT.START_BET_SUCCESS, startBetResponse);
      setTimeout(() => {
        this.socketServer.to(data.roomId).emit(SocketEvents.EMIT.END_BET, data);
        socket.emit(SocketEvents.EMIT.START_GAME_NOW, data);
      }, 30000);
    } else {
      console.log(`User ${socket.id} start bet failed: ${startBetResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.START_BET_FAILED, startBetResponse);
    }
  };

  onGetGameBettors = async (socket: Socket, gameId: string) => {
    const gameBettors = await this._gameService.getGameBettors(gameId);
    if (gameBettors.isSuccess) {
      console.log(`User ${socket.id} get game bettors of id ${gameId} successfully`);
      socket.emit(SocketEvents.EMIT.GET_GAME_BETTORS_SUCCESS, gameBettors);
    } else {
      console.log(`User ${socket.id} get game bettors of id ${gameId} failed: ${gameBettors.errorMessage}`);
      socket.emit(SocketEvents.EMIT.GET_GAME_BETTORS_FAILED, gameBettors);
    }
  };

  onBetForDuck = async (socket: Socket, data: IBetForDuckDTO) => {
    const betForDuckResponse = await this._gameService.betForDuck(data);
    if (betForDuckResponse.isSuccess) {
      console.log(`User ${socket.id} bet for duck`);
      const gameBettors = await this._gameService.getGameBettors(data.gameId);
      this.socketServer.to(data.roomId).emit(SocketEvents.EMIT.GET_GAME_BETTORS_SUCCESS, gameBettors);
      socket.emit(SocketEvents.EMIT.BET_FOR_DUCK_SUCCESS, betForDuckResponse);
    } else {
      console.log(`User ${socket.id} bet for duck failed: ${betForDuckResponse.errorMessage}`);
      socket.emit(SocketEvents.EMIT.BET_FOR_DUCK_FAILED, betForDuckResponse);
    }
  };

  onDisconnect = async (socket: Socket) => {
    const userBySocketResponse = await this._userService.getUserBySocketId(socket.id);
    const user = userBySocketResponse.data as User;
    this.onLeaveRoom(socket, { userId: user?.id, roomId: "" });
  };
}
export default SocketService;
