export interface IAccessTokenPayload {
  userId: string;
  username: string;
  role: string;
  roleName: string;
}
export interface IAccessTokenResponse {
  token: string;
  expiresAt: Date;
  expiresAtUtc: string;
}
export interface IJWTService {
  generateAccessToken(payload: IAccessTokenPayload): IAccessTokenResponse;
  verifyAccessToken(token: string): boolean;
  getTokenPayload(token: string): any;
  getTokenHeader(token: string): any;
  verifyOAuthToken(token: string): Promise<boolean>;
}
