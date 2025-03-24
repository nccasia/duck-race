import logger from "@/helpers/logger";
import { IUserService } from "@/interfaces/IUserService";
import { Hasher } from "@/utils/hash";
import { StatusCodes } from "http-status-codes";
import { Base64 } from "js-base64";
import * as queryString from "query-string";
class UserService implements IUserService {
  private static instance: UserService;
  private listUsers: Array<User> = [];

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
  public getListUsers(): Array<User> {
    return this.listUsers;
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
      const secretKey = Hasher.HMAC_SHA256(botToken, "WebAppData");
      const hashedData = Hasher.HEX(Hasher.HMAC_SHA256(secretKey, hashParamsString));

      if (hashedData !== hash) {
        return {
          statusCode: 401,
          isSuccess: false,
          errorMessage: "You are not authorized with Mezon, please login and try again",
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
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public async addUser(user: User): Promise<ServiceResponse> {
    // Implementation here
    try {
      this.listUsers.push(user);
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
        errorMessage: "Lỗi từ hệ thống",
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
          errorMessage: "Không tìm thấy mã người dùng",
        };
      }
      this.listUsers = this.listUsers.filter((user) => user.id !== id);
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
        errorMessage: "Lỗi từ hệ thống",
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
          errorMessage: "Không tìm thấy mã người dùng",
        };
      }
      const user = this.listUsers.find((user) => user.id === id);
      if (!user) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy người dùng",
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
        errorMessage: "Lỗi từ hệ thống",
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
          errorMessage: "Không tìm thấy mã socket",
        };
      }
      const user = this.listUsers.find((user) => user.socketId === socketId);
      if (!user) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy người dùng",
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
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public async getSocketIdOfUserAsync(userId: string): Promise<ServiceResponse> {
    // Implementation here
    try {
      if (!userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Không tìm thấy mã người dùng",
        };
      }
      const user = this.listUsers.find((user) => user.id === userId);
      if (!user) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy người dùng",
        };
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: user.socketId,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public getSocketIdOfUser(userId: string): ServiceResponse {
    try {
      if (!userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Không tìm thấy mã người dùng",
        };
      }
      const user = this.listUsers.find((user) => user.id === userId);
      if (!user) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy người dùng",
        };
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: user.socketId,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public async getListUsersAsync(): Promise<ServiceResponse> {
    // Implementation here
    try {
      return {
        statusCode: 200,
        isSuccess: true,
        data: this.listUsers,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }
}

export default UserService;
