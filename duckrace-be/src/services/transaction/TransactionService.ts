import { LocalStorage } from "@/constants/LocalStorage";
import { UpdateWalletTokenResponse } from "@/entities/User";
import logger from "@/helpers/logger";
import { IMezonClientService } from "@/interfaces/IMezonClientService";
import { ETransactionType, ITransactionService } from "@/interfaces/ITransactionService";
import { IUserService } from "@/interfaces/IUserService";
import { RequestStorage } from "@/middlewares/AsyncLocalStorage";
import { StatusCodes } from "http-status-codes";
import PrismaService from "../database/PrismaService";
class TransactionService implements ITransactionService {
  private prismaService: PrismaService;
  private userService: IUserService;
  private mezonClientService: IMezonClientService;

  constructor(PrismaService: PrismaService, UserService: IUserService, MezonClientService: IMezonClientService) {
    this.prismaService = PrismaService;
    this.userService = UserService;
    this.mezonClientService = MezonClientService;
  }

  public async depositToken(data: DepositTokenRequest): Promise<ServiceResponse> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request.user?.id;
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          isSuccess: false,
          errorMessage: "Unauthorized",
        };
      }
      if (data.amount <= 0) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          errorMessage: "Amount must be greater than 0",
        };
      }
      const dataTransaction: TransactionData = {
        userId,
        amount: data.amount,
        type: "DEPOSIT",
        isIncrease: true,
        note: "Deposit token",
      };
      const transaction = await this.prismaService.transaction.create({
        data: dataTransaction,
      });
      if (!transaction) {
        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          isSuccess: false,
          errorMessage: "Error when save transaction",
        };
      }
      const changeWallet = await this.userService.updateWalletToken(userId, data.amount);
      if (!changeWallet.isSuccess) {
        return changeWallet;
      }
      const updateWalletResponse = changeWallet.data as UpdateWalletTokenResponse;
      const depositTokenResponse = {
        transaction,
        currentWallet: updateWalletResponse.currentWallet,
      };
      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        data: depositTokenResponse,
      };
    } catch (error) {
      logger.error(error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }

  public async withdrawToken(data: DepositTokenRequest): Promise<ServiceResponse> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request.user?.id;
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          isSuccess: false,
          errorMessage: "Unauthorized",
        };
      }
      if (data.amount <= 0) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          errorMessage: "Amount must be greater than 0",
        };
      }
      const user = await this.userService.getUserById(userId);
      if (!user.isSuccess) {
        return user;
      }
      if (user.data?.walletToken < data.amount) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          errorMessage: "Not enough token",
        };
      }

      // Reward token for user with mezon-sdk
      const rewardResponse = await this.mezonClientService.rewardTokenForUser([user.data?.mezonUserId], data.amount);
      if (!rewardResponse.isSuccess) {
        return rewardResponse;
      }

      const dataTransaction: TransactionData = {
        userId,
        amount: data.amount,
        type: ETransactionType.WITHDRAW,
        isIncrease: false,
        note: "Withdraw token",
      };

      const transaction = await this.prismaService.transaction.create({
        data: dataTransaction,
      });

      if (!transaction) {
        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          isSuccess: false,
          errorMessage: "Error when save transaction",
        };
      }
      const changeWallet = await this.userService.updateWalletToken(userId, -data.amount);
      if (!changeWallet.isSuccess) {
        return changeWallet;
      }
      const updateWalletResponse = changeWallet.data as UpdateWalletTokenResponse;
      const depositTokenResponse = {
        transaction,
        currentWallet: updateWalletResponse.currentWallet,
      };
      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        data: depositTokenResponse,
      };
    } catch (error) {
      logger.error(error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }

  public async getHistoryTransaction(): Promise<ServiceResponse> {
    try {
      const request = RequestStorage.getStore()?.get(LocalStorage.REQUEST_STORE);
      const userId = request.user?.id;
      const transactions = await this.prismaService.transaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return {
        statusCode: StatusCodes.OK,
        isSuccess: true,
        data: transactions,
      };
    } catch (error) {
      logger.error(error);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        isSuccess: false,
        errorMessage: "Internal server error",
      };
    }
  }
}
export default TransactionService;
