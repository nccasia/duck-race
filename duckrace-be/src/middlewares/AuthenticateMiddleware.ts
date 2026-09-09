import { ErrorCodes } from "@/constants/ErrorCodes";
import { IJWTService } from "@/interfaces/IJWTService";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";

function AuthenticateMiddleware(JwtService: IJWTService): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    let accessToken = "";
    switch (process.env.AUTH_MODE) {
      case "COOKIE": {
        const cookies = req.cookies;
        if (!cookies || !cookies["accessToken"]) break;
        accessToken = cookies["accessToken"];
        break;
      }
      default: {
        const authorization = req.headers["authorization"];
        if (!authorization) break;
        accessToken = authorization.split(" ")[1];
        break;
      }
    }
    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        error: {
          message: ErrorCodes.UNAUTHORIZED,
          errorDetail: ErrorCodes.UNAUTHORIZED,
        },
        success: false,
        data: null,
        errorCode: ErrorCodes.UNAUTHORIZED,
        errorMessage: ErrorCodes.UNAUTHORIZED,
      });
    }
    // Decode the token to get the payload
    const payload: any = JwtService.getTokenPayload(accessToken);
    const isValid: boolean = JwtService.verifyAccessToken(accessToken);
    const isOAuthValid: boolean = !payload?.isCredential ? await JwtService.verifyOAuthToken(accessToken) : false;
    // If the token is not valid, return an 401 error code
    if (!isValid && !isOAuthValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        error: {
          message: ErrorCodes.UNAUTHORIZED,
          errorDetail: ErrorCodes.UNAUTHORIZED,
        },
        success: false,
        data: null,
        errorCode: ErrorCodes.UNAUTHORIZED,
        errorMessage: ErrorCodes.UNAUTHORIZED,
      });
    }
    req.user = {
      id: payload?.userId || payload?.userid || payload?.id,
      userName: payload?.username,
      playerName: payload?.playerName,
      wallet: payload?.wallet,
      mezonUserId: payload?.mezonUserId,
      email: payload?.email,
      avatar: payload?.avatar,
      accessToken: accessToken,
    };
    next();
  };
}

export default AuthenticateMiddleware;
