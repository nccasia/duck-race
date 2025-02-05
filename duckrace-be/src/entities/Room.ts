import { v4 as uuid } from "uuid";

class RoomInfo {
  public roomId: string;
  public roomName: string;
  public roomBet: number;
  public roomPassword: string;
  public roomUsePassword: boolean;
}
class Score {
  public oldScore: number;
  public newScore: number;
  public totalScore: number;
}

class Duck {
  public id: string;
  public name: string;
  public score: Score;
  public order: number;
  public colorNumber: number;
  role_id?: string[];
  userChannelId?: string;
  user?: {
    display_name: string;
    user_name: string;
    avatar_url: string;
  };
  isSelected?: boolean;
}

class Room {
  public roomId = uuid();
  public ownerId: string;
  public owner: User;
  public roomInfo: RoomInfo;
  public currentGame: string;
  public members: string[] = [];

  public expiredTime: number;
  public currentTime: number;
  public ducks: Duck[];
  public totalDuck: number;
  public status: "waiting" | "betting" | "confirming" | "racing" | "completed";
  public isPlaying = false;
}

export { Room, RoomInfo, Duck, Score };
