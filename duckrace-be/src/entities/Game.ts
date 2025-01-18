class Score {
  public oldScore: number;
  public newScore: number;
  public totalScore: number;
}

class Player {
  public id: string;
  public name: string;
  public score: Score;
  public order: number;
}

class Game {
  public id: string;
  public ownerId?: string;
  public expiredTime: number;
  public currentTime: number;
  public players: Player[];
  public totalPlayers: number;
  public status: "waiting" | "racing" | "completed";
}

export { Game, Player, Score };
