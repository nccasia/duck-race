import { IJWTService } from "@/interfaces/IJWTService";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

export default class JwtService implements IJWTService {
  private accessTokenSecret!: string;
  private accessTokenExpriedIn!: number;
  constructor() {
    this.accessTokenSecret = String(process.env.ACCESS_TOKEN_SECRET);
    this.accessTokenExpriedIn = Number(process.env.ACCESS_TOKEN_EXPIRES_IN);
  }

  generateAccessToken(payload: any) {
    const token = jwt.sign({ isCredential: true, ...payload }, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpriedIn,
    });
    const expiresAt = new Date(Date.now() + this.accessTokenExpriedIn * 1000);
    return {
      token,
      expiresAt,
      expiresAtUtc: expiresAt.toUTCString(),
    };
  }
  verifyAccessToken(token: string): boolean {
    try {
      jwt.verify(token, this.accessTokenSecret);
      return true;
    } catch {
      return false;
    }
  }
  getTokenPayload(token: string) {
    return jwt.decode(token);
  }

  getTokenHeader(token: string) {
    const header = jwt.decode(token, { complete: true })?.header;
    return header;
  }

  async verifyOAuthToken(token: string): Promise<boolean> {
    try {
      const tokenHeader = this.getTokenHeader(token);
      const kid = tokenHeader?.kid;
      if (!kid) return false;
      const jwksUri = process.env.AUTH_SERVER_URL + "/.well-known/openid-configuration/jwks";
      const client = jwksClient({ jwksUri });
      const key = await client.getSigningKey(kid);
      const publicKey = key.getPublicKey();
      jwt.verify(token, publicKey, { algorithms: ["RS256"] });
      return true;
    } catch {
      return false;
    }
  }
}
