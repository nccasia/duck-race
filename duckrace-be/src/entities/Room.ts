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
  public role_id?: string[];
  public userChannelId?: string;
  public user?: {
    display_name: string;
    user_name: string;
    avatar_url: string;
  };
  public isSelected?: boolean;
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

export { Duck, Room, RoomInfo, Score };
