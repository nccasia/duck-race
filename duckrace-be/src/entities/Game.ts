import { Duck } from "./Room";

class GameBettor {
  public userId: string;
  public duckId: string;
  public betAmount: number;
  public isConfirmed: boolean;
}

class Game {
  public id: string;
  public ownerId?: string;
  public roomId: string;
  public gameStatus: "waiting" | "betting" | "confirming" | "racing" | "completed";
  public winners: string[];
  public bettors: string[];
  public totalBet: number;
  public gameBettors: GameBettor[];
}

class BettorDetail {
  public userId: string;
  public duckId: string;
  public betAmount: number;
  public user: User;
}
class BettorOfDucks extends Duck {
  public bettors: BettorDetail[];
}

export { Game, GameBettor, BettorDetail, BettorOfDucks };
