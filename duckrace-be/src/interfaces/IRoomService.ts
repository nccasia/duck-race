import { ICreateGameSubmitDTO } from "@/models/games/ICreateGameSubmitDTO";
import { IAddDuckToRoomDTO } from "@/models/rooms/IAddDuckToRoomDTO";
import { IChangeTimeSubmitDTO } from "@/models/rooms/IChangeTimeSubmitDTO";
import { CreateRoomSubmitDTO } from "@/models/rooms/ICreateRoomSubmitDTO";
import { IJoinRoomSubmitDTO } from "@/models/rooms/IJoinRoomSubmitDTO";
import { IRemoveDuckDTO } from "@/models/rooms/IRemoveDuckDTO";
import { IStartGameSubmitDTO } from "@/models/rooms/IStartGameSubmitDTO";
import { IUpdateListDuckDTO } from "@/models/rooms/IUpdateListDuckDTO";

export interface IRoomService {
  createRoomAsync(room: CreateRoomSubmitDTO): Promise<ServiceResponse>;
  getListRooms(): Promise<ServiceResponse>;
  removeRoom(roomId: string): Promise<ServiceResponse>;
  getRoomById(roomId: string): Promise<ServiceResponse>;
  checkRoomBeforeJoin(room: IJoinRoomSubmitDTO): Promise<ServiceResponse>;
  joinRoom(room: IJoinRoomSubmitDTO): Promise<ServiceResponse>;
  leaveRoom(room: IJoinRoomSubmitDTO): Promise<ServiceResponse>;
  getMemberOfRoom(roomId: string): Promise<ServiceResponse>;
  getDucksOfRoom(roomId: string): Promise<ServiceResponse>;
  startBet(roomId: string): Promise<ServiceResponse>;

  addDuckToRoom(addUserData: IAddDuckToRoomDTO): Promise<ServiceResponse>;
  checkGameCompleted(gameId: string): boolean;
  removeDuckFromRoom(removeUserData: IRemoveDuckDTO): Promise<ServiceResponse>;
  updateListDuckOfRoom(data: IUpdateListDuckDTO): Promise<ServiceResponse>;
  changeTimeOfGame(data: IChangeTimeSubmitDTO): Promise<ServiceResponse>;
  startNewGame(data: IStartGameSubmitDTO): Promise<ServiceResponse>;
  resetGame(data: IStartGameSubmitDTO): Promise<ServiceResponse>;
  startTurn(gameId: string): Promise<ServiceResponse>;
}
