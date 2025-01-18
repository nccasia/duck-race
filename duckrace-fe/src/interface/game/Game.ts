export interface IScore {
  oldScore: number;
  newScore: number;
  totalScore: number;
}

export interface IPlayer {
  id: string;
  name: string;
  score: IScore;
  order: number;
}

export interface IGame {
  id: string;
  expiredTime: number;
  players: IPlayer[];
  totalPlayers: number;
  isEnded: boolean;
  status: "waiting" | "racing" | "completed";
}
