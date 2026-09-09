import { ErrorCodes, TransactionNotes } from "@/constants/ErrorCodes";
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
          errorCode: ErrorCodes.UNAUTHORIZED,
          errorMessage: ErrorCodes.UNAUTHORIZED,
        };
      }
      if (data.amount <= 0) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          errorCode: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
          errorMessage: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
        };
      }
      const dataTransaction: TransactionData = {
        userId,
        amount: data.amount,
        type: "DEPOSIT",
        isIncrease: true,
        note: TransactionNotes.DEPOSIT,
      };
      const transaction = await this.prismaService.transaction.create({
        data: dataTransaction,
      });
      if (!transaction) {
        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          isSuccess: false,
          errorCode: ErrorCodes.TRANSACTION_SAVE_ERROR,
          errorMessage: ErrorCodes.TRANSACTION_SAVE_ERROR,
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
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
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
          errorCode: ErrorCodes.UNAUTHORIZED,
          errorMessage: ErrorCodes.UNAUTHORIZED,
        };
      }
      if (data.amount <= 0) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          isSuccess: false,
          errorCode: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
          errorMessage: ErrorCodes.AMOUNT_MUST_BE_POSITIVE,
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
          errorCode: ErrorCodes.NOT_ENOUGH_TOKEN,
          errorMessage: ErrorCodes.NOT_ENOUGH_TOKEN,
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
        note: TransactionNotes.WITHDRAW,
      };

      const transaction = await this.prismaService.transaction.create({
        data: dataTransaction,
      });

      if (!transaction) {
        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          isSuccess: false,
          errorCode: ErrorCodes.TRANSACTION_SAVE_ERROR,
          errorMessage: ErrorCodes.TRANSACTION_SAVE_ERROR,
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
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
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
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
        errorMessage: ErrorCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
export default TransactionService;
