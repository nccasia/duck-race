export interface User {
  id?: string;
  name?: string;
  userName: string;
  avatar?: string;
  email?: string;
  wallet?: number;
  isConnected?: boolean;
}

export interface IUserHashInfo {
  hashData: string;
}

export interface IGetAccessToken {
  userData: User;
  hashData: string;
}
