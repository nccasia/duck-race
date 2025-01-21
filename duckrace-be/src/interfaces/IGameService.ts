import { Game, Player } from "@/entities/Game";
import { IAddPlayerSubmitDTO } from "@/models/games/IAddPlayerSubmitDTO";
import { IChangeTimeSubmitDTO } from "@/models/games/IChangeTimeSubmitDTO";
import { IRemovePlayerSubmitDTO } from "@/models/games/IRemovePlayerSubmitDTO";
import { IStartGameSubmitDTO } from "@/models/games/IStartGameSubmitDTO";
import { IUpdateListPlayerDTO } from "@/models/games/IUpdateListPlayerDTO";

export interface IGameService {
  startNewGame(data: IStartGameSubmitDTO): Promise<ServiceResponse>;
  startTurn(gameId: string): Promise<ServiceResponse>;
  checkGameCompleted(gameId: string): boolean;
  addPlayerToGame(addUserData: IAddPlayerSubmitDTO): Promise<ServiceResponse>;
  removePlayerFromGame(removeUserData: IRemovePlayerSubmitDTO): Promise<ServiceResponse>;
  createNewGame(game: string): Promise<ServiceResponse>;
  getGameById(gameId: string): Promise<ServiceResponse>;
  removeGame(gameId: string): Promise<ServiceResponse>;
  resetGame(gameId: IStartGameSubmitDTO): Promise<ServiceResponse>;
  changeTimeOfGame(data: IChangeTimeSubmitDTO): Promise<ServiceResponse>;
  updateUserOfGame(data: IUpdateListPlayerDTO): Promise<ServiceResponse>;
}
