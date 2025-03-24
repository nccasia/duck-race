import { Duck, Room } from "@/entities/Room";
import logger from "@/helpers/logger";
import { IRoomService } from "@/interfaces/IRoomService";
import { IUserService } from "@/interfaces/IUserService";
import { IAddDuckToRoomDTO } from "@/models/rooms/IAddDuckToRoomDTO";
import { IChangeTimeSubmitDTO } from "@/models/rooms/IChangeTimeSubmitDTO";
import { CreateRoomSubmitDTO } from "@/models/rooms/ICreateRoomSubmitDTO";
import { IJoinRoomSubmitDTO } from "@/models/rooms/IJoinRoomSubmitDTO";
import { IRemoveDuckDTO } from "@/models/rooms/IRemoveDuckDTO";
import { IStartGameSubmitDTO } from "@/models/rooms/IStartGameSubmitDTO";
import { IUpdateListDuckDTO } from "@/models/rooms/IUpdateListDuckDTO";
import { generateId } from "@/utils/generateId";
import UserService from "../user/UserService";

class RoomService implements IRoomService {
  private static instance: RoomService;
  private listRooms: Array<Room> = [];
  private _userService: IUserService;
  private constructor() {
    this._userService = UserService.getInstance();
  }

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  private randomDuckArray(ducks: Duck[]): Duck[] {
    // Implementation here
    const randomDuckArray = [...ducks].sort(() => Math.random() - 0.5);
    return randomDuckArray;
  }

  private updateScoreOfDuck(roomId: string, duckId: string, score: number): void {
    // Implementation here
    const currentRoom = this.listRooms.find((room) => room.roomId === roomId);
    const duck = currentRoom?.ducks.find((duck) => duck.id === duckId);
    if (duck) {
      duck.score.oldScore = duck.score.totalScore;
      duck.score.totalScore += score;
      duck.score.newScore = duck.score.totalScore;
    }
  }

  private updateCurrentTimeOfGame(roomId: string, currentTime?: number): void {
    const currentRoom = this.listRooms.find((room) => room.roomId === roomId);
    if (!currentRoom) return;
    if (currentTime) {
      currentRoom.currentTime = currentTime;
    } else {
      currentRoom.currentTime++;
    }
  }

  public async getListRooms(): Promise<ServiceResponse> {
    // Implementation here
    try {
      return {
        statusCode: 200,
        isSuccess: true,
        data: this.listRooms,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async removeRoom(roomId: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!roomId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Không tìm thấy mã phòng",
        };
      }
      const roomIndex = this.listRooms.findIndex((room) => room.roomId === roomId);
      if (roomIndex === -1) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      this.listRooms.splice(roomIndex, 1);
      return {
        statusCode: 200,
        isSuccess: true,
        data: roomId,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }
  public async getRoomById(roomId: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      const room = this.listRooms.find((room) => room.roomId === roomId);
      if (!room) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: room,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async checkRoomBeforeJoin(data: IJoinRoomSubmitDTO): Promise<ServiceResponse> {
    if (!data.roomId || !data.userId) {
      return {
        statusCode: 400,
        isSuccess: false,
        errorMessage: "Please check your data",
      };
    }
    const room = this.listRooms.find((room) => room.roomId === data.roomId);
    if (!room) {
      return {
        statusCode: 400,
        isSuccess: false,
        errorMessage: "Room is not found",
      };
    }
    if (room.status === "racing" || room.status === "betting") {
      return {
        statusCode: 400,
        isSuccess: false,
        errorMessage: "Room is playing, you can't join now",
      };
    }

    const user = await this._userService.getUserById(data.userId);
    if (!user || !user.isSuccess) {
      return user;
    }
    if ((user.data as User).wallet < room.roomInfo.roomBet) {
      return {
        statusCode: 400,
        isSuccess: false,
        errorMessage: "You don't have enough money to join this room",
      };
    }
    return {
      statusCode: 200,
      isSuccess: true,
      data: room.roomInfo,
    };
  }

  public async joinRoom(data: IJoinRoomSubmitDTO): Promise<ServiceResponse> {
    try {
      const checkBeforeJoinRoomResponse = await this.checkRoomBeforeJoin(data);
      if (!checkBeforeJoinRoomResponse.isSuccess) {
        return checkBeforeJoinRoomResponse;
      }
      const room = await this.getRoomById(data.roomId);
      if (!room.isSuccess) {
        return room;
      }
      const newRoom = room.data as Room;
      const checkUserInRoom = newRoom.members.find((userId) => userId === data.userId);
      if (!checkUserInRoom) {
        newRoom.members.push(data.userId);
      }

      const roomInfo = await this.getRoomById(data.roomId);
      return roomInfo;
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }

  public async leaveRoom(room: IJoinRoomSubmitDTO): Promise<ServiceResponse> {
    try {
      if (!room.userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Please check your data",
        };
      }

      const currentRoom = this.listRooms.find((r) => r.members.includes(room.userId));
      if (currentRoom) {
        currentRoom.members = currentRoom.members.filter((userId) => userId !== room.userId);
        if (currentRoom.ownerId === room.userId) {
          currentRoom.ownerId = currentRoom.members[0];
          currentRoom.owner = (await this._userService.getUserById(currentRoom.ownerId)).data as User;
        }
        if (currentRoom.members.length === 0) {
          this.removeRoom(currentRoom.roomId);
        }
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentRoom,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }

  public async getMemberOfRoom(roomId: string): Promise<ServiceResponse> {
    try {
      const room = await this.getRoomById(roomId);
      if (!room.isSuccess) {
        return room;
      }
      const listUsers = this._userService.getListUsers();
      const listMembers = room.data?.members?.map((userId: string) => {
        const user = listUsers.find((user) => user.id === userId);
        return user;
      });
      return {
        statusCode: 200,
        isSuccess: true,
        data: listMembers,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }

  public async createRoomAsync(room: CreateRoomSubmitDTO): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!room.roomName || !room.roomBet) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Please check your data",
        };
      }
      if (room.roomBet <= 0) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Your bet must be greater than 0",
        };
      }
      if (room.roomBet > 100000) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Your bet must be less than 100000",
        };
      }

      const owner = await this._userService.getUserById(room.ownerId);
      if (!owner || !owner.isSuccess) {
        return owner;
      }
      const newRoom = new Room();
      const roomId = generateId(6, "number");
      newRoom.roomInfo = {
        roomId,
        roomName: room.roomName,
        roomBet: +room.roomBet,
        roomPassword: room.roomPassword,
        roomUsePassword: room.roomUsePassword,
      };
      newRoom.ownerId = room.ownerId;
      newRoom.roomId = roomId;
      newRoom.owner = owner.data as User;
      newRoom.members = [];
      newRoom.isPlaying = false;
      newRoom.currentTime = 0;
      newRoom.expiredTime = 60;
      newRoom.ducks = [];
      newRoom.totalDuck = 0;
      newRoom.status = "waiting";
      this.listRooms.push(newRoom);

      // Implementation here
      return {
        statusCode: 200,
        isSuccess: true,
        message: "Room created successfully",
        data: newRoom,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }

  public checkGameCompleted(roomId: string): boolean {
    const currentRoom = this.listRooms.find((room) => room.roomId === roomId);
    if (!currentRoom) return true;
    // Implementation here
    if (currentRoom.currentTime >= currentRoom.expiredTime) {
      currentRoom.status = "completed";
      return true;
    }
    return false;
  }

  public async getDucksOfRoom(roomId: string): Promise<ServiceResponse> {
    try {
      const room = this.listRooms.find((room) => room.roomId === roomId);
      if (!room) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: room.ducks,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }
  public async addDuckToRoom(addDuckData: IAddDuckToRoomDTO): Promise<ServiceResponse> {
    try {
      const room = this.listRooms.find((room) => room.roomId === addDuckData.roomId);
      if (!room) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      const duckNumber = room.ducks.length;
      addDuckData.ducks.forEach((duck, index) => {
        if (duck?.trim() !== "") {
          const colorNumber = Math.floor(Math.random() * 10) + 1;
          room.ducks.push({
            id: generateId(10, "mixed"),
            name: duck?.trim(),
            score: { oldScore: 0, newScore: 0, totalScore: 0 },
            order: duckNumber + index + 1,
            colorNumber,
          });
        }
      });
      room.totalDuck = room.ducks.length;
      return {
        statusCode: 200,
        isSuccess: true,
        data: room,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async removeDuckFromRoom(removeDuckData: IRemoveDuckDTO): Promise<ServiceResponse> {
    try {
      const room = this.listRooms.find((room) => room.roomId === removeDuckData.roomId);
      if (!room) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      room.ducks = room.ducks.filter((player) => !removeDuckData.ducks.includes(player.id));
      room.totalDuck = room.ducks.length;
      room.ducks.forEach((player, index) => {
        player.order = index + 1;
      });
      return {
        statusCode: 200,
        isSuccess: true,
        data: room,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async changeTimeOfGame(changeTimeData: IChangeTimeSubmitDTO): Promise<ServiceResponse> {
    try {
      const currentRoom = this.listRooms.find((room) => room.roomId === changeTimeData.roomId);
      if (!currentRoom) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      currentRoom.expiredTime = changeTimeData.expiredTime;
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentRoom,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async updateListDuckOfRoom(updateUserData: IUpdateListDuckDTO): Promise<ServiceResponse> {
    try {
      const currentRoom = this.listRooms.find((room) => room.roomId === updateUserData.roomId);
      if (!currentRoom) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      updateUserData.ducks.forEach((duck, index) => {
        duck.colorNumber = Math.floor(Math.random() * 10) + 1;
        duck.score = { oldScore: 0, newScore: 0, totalScore: 0 };
        duck.order = index + 1;
      });
      currentRoom.ducks = updateUserData.ducks;
      currentRoom.totalDuck = updateUserData.ducks.length;
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentRoom,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async resetGame(resetGameData: IStartGameSubmitDTO): Promise<ServiceResponse> {
    try {
      const currentRoom = this.listRooms.find((room) => room.roomId === resetGameData.roomId);
      if (!currentRoom) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      currentRoom.ducks.forEach((player) => {
        player.score = { oldScore: 0, newScore: 0, totalScore: 0 };
      });
      currentRoom.currentTime = 0;
      currentRoom.status = "waiting";
      if (resetGameData.currentGame) {
        currentRoom.currentGame = resetGameData.currentGame;
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentRoom,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async startNewGame(startGameData: IStartGameSubmitDTO): Promise<ServiceResponse> {
    try {
      const currentRoom = this.listRooms.find((room) => room.roomId === startGameData.roomId);
      if (!currentRoom) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Game is not found",
        };
      }
      if (currentRoom.ducks.length < 5) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "You need at least 5 ducks to start the game",
        };
      }
      const resetGameResponse = await this.resetGame(startGameData);
      if (!resetGameResponse.isSuccess) {
        return resetGameResponse;
      }
      currentRoom.status = "racing";
      return resetGameResponse;
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async startTurn(roomId: string): Promise<ServiceResponse> {
    try {
      const currentRoom = this.listRooms.find((room) => room.roomId === roomId);
      if (!currentRoom) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }

      const ducks = currentRoom.ducks;
      const randomListDuck = this.randomDuckArray(ducks);
      const startScore = 1;
      const endScore = 6;
      let score = startScore;
      randomListDuck?.forEach((duck, index) => {
        let turnScore = score + (index % 6);
        if (turnScore > endScore) {
          turnScore = startScore;
          score = startScore;
        }
        this.updateScoreOfDuck(currentRoom.roomId, duck.id, turnScore);
      });
      this.updateCurrentTimeOfGame(currentRoom.roomId);
      const roomAfterTurn = this.listRooms.find((room) => room.roomId === roomId);
      return {
        statusCode: 200,
        isSuccess: true,
        data: roomAfterTurn,
        message: "COMPLETED-GAME",
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }
  public async startBet(roomId: string): Promise<ServiceResponse> {
    try {
      const currentRoom = this.listRooms.find((room) => room.roomId === roomId);
      if (!currentRoom) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }
      currentRoom.status = "betting";
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentRoom,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }
}

export default RoomService;
