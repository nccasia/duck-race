import { ErrorCodes } from "@/constants/ErrorCodes";
import { GetAccessToken } from "@/entities/User";
import logger from "@/helpers/logger";
import { IJWTService } from "@/interfaces/IJWTService";
import { IUserService } from "@/interfaces/IUserService";
import { Hasher } from "@/utils/hash";
import { StatusCodes } from "http-status-codes";
import { Base64 } from "js-base64";
import * as queryString from "query-string";
import md5 from "md5";
import PrismaService from "../database/PrismaService";

class UserService implements IUserService {
  private prismaService: PrismaService;
  private jwtService: IJWTService;

  constructor(PrismaService: PrismaService, JwtService: IJWTService) {
    this.prismaService = PrismaService;
    this.jwtService = JwtService;
  }

  public async getAccessTokenAsync(data: GetAccessToken): Promise<ServiceResponse> {
    try {
      const { hashData } = data;
      const checkHash = await this.verifyHashUser(hashData);
      if (!checkHash.isSuccess) {
        return checkHash;
      }
      const userData = checkHash.data as MezonUser;
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          mezonUserId: String(userData.id),
        },
      });
      if (!checkUser) {
        const addUserResponse = await this.addUser({
          ...userData,
        });

        if (!addUserResponse.isSuccess) {
          return addUserResponse;
        }
      }
      const getUserResponse = await this.prismaService.user.findUnique({
        where: {
          mezonUserId: String(userData.id),
        },
      });
      if (!getUserResponse) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorCode: ErrorCodes.USER_NOT_FOUND,
          errorMessage: ErrorCodes.USER_NOT_FOUND,
        };
      }
      const generateTokenData = {
        id: getUserResponse.id,
        mezonUserId: getUserResponse.mezonUserId,
        userName: getUserResponse.userName,
        playerName: getUserResponse.playerName,
        wallet: getUserResponse.wallet,
      };
      const accessToken = this.jwtService.generateAccessToken(generateTokenData);
      return {
        statusCode: 200,
        isSuccess: true,
        data: {
          userInfor: getUserResponse,
          accessToken: accessToken,
        },
      };
    } catch (error) {
      console.log("Error in UserService -> getAccessTokenAsync", error);
      // logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.LOGIN_SYSTEM_ERROR,
        errorMessage: ErrorCodes.LOGIN_SYSTEM_ERROR,
      };
    }
  }

  public async getListUsers(): Promise<ServiceResponse> {
    try {
      const users = await this.prismaService.user.findMany();
      return {
        statusCode: 200,
        isSuccess: true,
        data: users,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async verifyHashUser(hashData: string): Promise<ServiceResponse> {
    try {
      const rawHashData = Base64.decode(hashData);
      const mezonEventData: any = queryString.parse(rawHashData, {
        sort: false,
      });

      const { hash, ...hashParams } = mezonEventData as HashData;
      const mezonUser = JSON.parse(hashParams?.user) as MezonUser;
      const hashParamsString = rawHashData.split("&hash=")[0];
      const botToken = process.env.MEZON_APP_TOKEN || "";

      const hashedBotToken = md5(botToken);
      const secretKey = Hasher.HMAC_SHA256(hashedBotToken, "WebAppData");
      const hashedData = Hasher.HEX(Hasher.HMAC_SHA256(secretKey, hashParamsString));

      if (hashedData !== hash) {
        return {
          statusCode: 401,
          isSuccess: false,
          errorCode: ErrorCodes.MEZON_AUTH_FAILED,
          errorMessage: ErrorCodes.MEZON_AUTH_FAILED,
        };
      }
      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        data: mezonUser,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.MEZON_LOGIN_ERROR,
        errorMessage: ErrorCodes.MEZON_LOGIN_ERROR,
      };
    }
  }

  public async addUser(user: MezonUser): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!user.id || !user.username) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.USER_INFO_REQUIRED,
          errorMessage: ErrorCodes.USER_INFO_REQUIRED,
        };
      }
      const addUserResponse = await this.prismaService.user.create({
        data: {
          wallet: 0,
          mezonUserId: String(user.id),
          userName: user.username,
          playerName: user?.display_name || user.username,
          avatar: user?.avatar_url
        }
      });
      return {
        statusCode: 200,
        isSuccess: true,
        data: addUserResponse,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async updateWalletToken(userId: string, amount: number): Promise<ServiceResponse> {
    try {
      if (!userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.USER_ID_NOT_FOUND,
          errorMessage: ErrorCodes.USER_ID_NOT_FOUND,
        };
      }
      if (!amount) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.WALLET_AMOUNT_REQUIRED,
          errorMessage: ErrorCodes.WALLET_AMOUNT_REQUIRED,
        };
      }
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorCode: ErrorCodes.USER_NOT_FOUND,
          errorMessage: ErrorCodes.USER_NOT_FOUND,
        };
      }
      if (user.wallet + amount < 0) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.INSUFFICIENT_WALLET,
          errorMessage: ErrorCodes.INSUFFICIENT_WALLET,
        };
      }
      const updateWallet = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          wallet: user.wallet + amount,
        },
      });
      const updateWalletResponse = {
        userId: updateWallet.id,
        amount: amount,
        currentWallet: updateWallet.wallet,
      };
      return {
        statusCode: 200,
        isSuccess: true,
        data: updateWalletResponse,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async removeUser(id: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!id) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.USER_ID_NOT_FOUND,
          errorMessage: ErrorCodes.USER_ID_NOT_FOUND,
        };
      }
      await this.prismaService.user.delete({
        where: {
          id: id,
        },
      });
      return {
        statusCode: 200,
        isSuccess: true,
        data: id,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async getUserById(id: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!id) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.USER_ID_NOT_FOUND,
          errorMessage: ErrorCodes.USER_ID_NOT_FOUND,
        };
      }
      const user = await this.prismaService.user.findUnique({
        where: {
          id: id,
        },
      });
      if (!user) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorCode: ErrorCodes.USER_NOT_FOUND,
          errorMessage: ErrorCodes.USER_NOT_FOUND,
        };
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: user,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async getUserBySocketId(socketId: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!socketId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.SOCKET_ID_NOT_FOUND,
          errorMessage: ErrorCodes.SOCKET_ID_NOT_FOUND,
        };
      }
      // const user = this.listUsers.find((user) => user.socketId === socketId);
      // if (!user) {
      //   return {
      //     statusCode: 404,
      //     isSuccess: false,
      //     errorMessage: "Không tìm thấy người dùng",
      //   };
      // }
      return {
        statusCode: 200,
        isSuccess: true,
        // data: user,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async getSocketIdOfUserAsync(userId: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      // if (!userId) {
      //   return {
      //     statusCode: 400,
      //     isSuccess: false,
      //     errorMessage: "Không tìm thấy mã người dùng",
      //   };
      // }
      // const user = this.listUsers.find((user) => user.id === userId);
      // if (!user) {
      //   return {
      //     statusCode: 404,
      //     isSuccess: false,
      //     errorMessage: "Không tìm thấy người dùng",
      //   };
      // }
      return {
        statusCode: 200,
        isSuccess: true,
        // data: user.socketId,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public getSocketIdOfUser(userId: string): ServiceResponse {
    try {
      if (!userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorCode: ErrorCodes.USER_ID_NOT_FOUND,
          errorMessage: ErrorCodes.USER_ID_NOT_FOUND,
        };
      }
      // const user = this.listUsers.find((user) => user.id === userId);
      // if (!user) {
      //   return {
      //     statusCode: 404,
      //     isSuccess: false,
      //     errorMessage: "Không tìm thấy người dùng",
      //   };
      // }
      return {
        statusCode: 200,
        isSuccess: true,
        // data: user.socketId,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

export default UserService;
