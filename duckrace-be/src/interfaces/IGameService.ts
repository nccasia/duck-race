import { IBetForDuckDTO } from "@/models/games/IBetForDuckDTO";
import { IConfirmBet } from "@/models/games/IConfirmBet";
import { ICreateGameSubmitDTO } from "@/models/games/ICreateGameSubmitDTO";

export interface IGameService {
  createNewGame(game: ICreateGameSubmitDTO): Promise<ServiceResponse>;
  getGameById(gameId: string): Promise<ServiceResponse>;
  getGameBettors(gameId: string): Promise<ServiceResponse>;
  betForDuck(betData: IBetForDuckDTO): Promise<ServiceResponse>;
  confirmBetForDuck(dataConfirm: IConfirmBet): Promise<ServiceResponse>;
  endGame(gameId: string): Promise<ServiceResponse>;
  rewardToken(winners: string[], winBet: number): Promise<ServiceResponse>;
}
