import logger from "@/helpers/logger";
import { IUserService } from "@/interfaces/IUserService";
import { Hasher } from "@/utils/hash";
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

  public async hashUser(user: User, hashKey: string): Promise<ServiceResponse> {
    try {
      const preHashData = {
        userid: user.id,
        username: user.userName,
      };
      const dataKeys = Object.keys(preHashData).sort();
      const hashParams = dataKeys.map((key) => `${key}=${preHashData[key]}`).join("\n");

      const botToken = process.env.MEZON_APP_SECRET;
      const secretKey = Hasher.HMAC_SHA256(botToken, "WebAppData");
      const hashedData = Hasher.HEX(Hasher.HMAC_SHA256(secretKey, hashParams));

      if (hashedData !== hashKey) {
        return {
          statusCode: 401,
          isSuccess: false,
          errorMessage: "You are not authorized with Mezon, please login and try again",
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
