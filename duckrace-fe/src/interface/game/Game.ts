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
  role_id?: string[];
  userChannelId?: string;
  user?: {
    display_name: string;
    user_name: string;
    avatar_url: string;
  };
  isSelected?: boolean;
}

export interface IGame {
  id: string;
  expiredTime: number;
  players: IPlayer[];
  totalPlayers: number;
  isEnded: boolean;
  status: "waiting" | "racing" | "completed";
}

export interface IMezonClan {
  id: string;
  clan_id: string;
  color: string;
  slug: string;
  title: string;
}
export interface IMezonUser {
  id: string;
  role_id: string[];
  userChannelId: string;
  user: {
    display_name: string;
    user_name: string;
    avatar_url: string;
  };
  isSelected: boolean;
}
