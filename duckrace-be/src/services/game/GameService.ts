import { BettorOfDucks, Game } from "@/entities/Game";
import logger from "@/helpers/logger";
import { IGameService } from "@/interfaces/IGameService";
import { IMezonClientService } from "@/interfaces/IMezonClientService";
import { IRoomService } from "@/interfaces/IRoomService";
import { IUserService } from "@/interfaces/IUserService";
import { IBetForDuckDTO } from "@/models/games/IBetForDuckDTO";
import { IConfirmBet } from "@/models/games/IConfirmBet";
import { ICreateGameSubmitDTO } from "@/models/games/ICreateGameSubmitDTO";
import { generateId } from "@/utils/generateId";
import JwtService from "../auth/JWTService";
import PrismaService from "../database/PrismaService";
import MezonClientService from "../mezon-client/MezonClientService";
import RoomService from "../room/RoomService";
import UserService from "../user/UserService";

class GameService implements IGameService {
  private static instance: GameService;
  private listGame: Game[] = [];
  private _roomService: IRoomService;
  private _userService: IUserService;
  private _mezonClientService: IMezonClientService;

  constructor(UserService: IUserService) {
    this._roomService = RoomService.getInstance();
    this._userService = UserService;
    this._mezonClientService = MezonClientService.getInstance();
  }

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService(new UserService(new PrismaService(), new JwtService()));
    }
    return GameService.instance;
  }

  public async createNewGame(gameData: ICreateGameSubmitDTO): Promise<ServiceResponse> {
    try {
      const roomResponse = await this._roomService.getRoomById(gameData.roomId);
      if (!roomResponse.isSuccess) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Room is not found",
        };
      }

      const gameId = generateId(10, "mixed");
      const game = new Game();
      game.id = gameId;
      game.ownerId = gameData.userId;
      game.roomId = gameData.roomId;
      game.gameStatus = "waiting";
      game.gameBettors = [];
      game.totalBet = 0;
      game.winners = [];
      game.bettors = [];
      this.listGame.push(game);
      roomResponse.data.currentGame = gameId;
      return {
        statusCode: 201,
        isSuccess: true,
        data: game,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async getGameById(gameId: string): Promise<ServiceResponse> {
    try {
      const game = this.listGame.find((game) => game.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Game is not found",
        };
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: game,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async betForDuck(betData: IBetForDuckDTO): Promise<ServiceResponse> {
    try {
      if (!betData.gameId || !betData.userId || !betData.ducks) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Please fill in all fields",
        };
      }
      const game = this.listGame.find((game) => game.id === betData.gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Game is not found",
        };
      }
      betData.ducks.forEach((duckId) => {
        const checkBet = game.gameBettors.find((bettor) => bettor.userId === betData.userId && bettor.duckId === duckId);
        if (!checkBet) {
          game.gameBettors.push({
            userId: betData.userId,
            duckId: duckId,
            betAmount: betData.betAmount,
            isConfirmed: false,
          });
          game.totalBet += betData.betAmount;
        }
      });

      if (!game.bettors.includes(betData.userId)) {
        game.bettors.push(betData.userId);
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: game,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server" + error?.message,
      };
    }
  }

  public async confirmBetForDuck(confirmBetData: IConfirmBet): Promise<ServiceResponse> {
    try {
      if (!confirmBetData.gameId || !confirmBetData.userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Please fill in all fields",
        };
      }
      const game = this.listGame.find((game) => game.id === confirmBetData.gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Game is not found",
        };
      }
      game.gameBettors.forEach((bettor) => {
        if (bettor.userId === confirmBetData.userId) {
          bettor.isConfirmed = true;
        }
      });
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server",
      };
    }
  }

  public async getGameBettors(gameId: string): Promise<ServiceResponse> {
    try {
      if (!gameId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Please fill in all fields",
        };
      }
      const game = this.listGame.find((game) => game.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Game is not found",
        };
      }
      const listUserResponse = this._userService.getListUsers();
      const listUser = (await listUserResponse).data as User[];
      const ducksResponse = await this._roomService.getDucksOfRoom(game.roomId);
      const listDucks = ducksResponse.data;
      const gameBettors: BettorOfDucks[] = listDucks?.map((duck) => {
        const bettorsOfThisDuck = game.gameBettors?.filter((bettor) => bettor.duckId === duck.id);
        const bettors = bettorsOfThisDuck?.map((bettor) => {
          const user = listUser.find((user) => user.id === bettor.userId);
          return {
            ...bettor,
            user,
          };
        });
        return {
          ...duck,
          bettors,
        };
      });
      return {
        statusCode: 200,
        isSuccess: true,
        data: gameBettors,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server" + error?.message,
      };
    }
  }

  public async rewardToken(winners: string[], winBet: number): Promise<ServiceResponse> {
    try {
      const data = await this._mezonClientService.rewardTokenForUser(winners, winBet);
      console.log("data", data);
      return data;
    } catch (error) {
      console.error("Error:", error);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: " rewardBetForDuck error",
      };
    }
  }

  private async rewardBetForDuck(currentGameId: string, winners: string[], winBet: number): Promise<ServiceResponse> {
    if (!winners || winners.length === 0) {
      return {
        statusCode: 200,
        isSuccess: true,
        errorMessage: "No winners",
      };
    }
    const API_KEY = process.env.API_KEY ?? "";
    const MEZON_APP_ID = process.env.MEZON_APP_ID ?? "";
    const url = process.env.REWARD_URL ?? "";
    const headers = {
      apiKey: API_KEY,
      appId: MEZON_APP_ID,
      "Content-Type": "application/json",
    };

    const data = {
      sessionId: currentGameId,
      userRewardedList: winners?.map((winner) => ({
        userId: winner,
        amount: winBet,
      })),
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        statusCode: 200,
        isSuccess: true,
        errorMessage: "rewardBetForDuck success",
      };
    } catch (error) {
      console.error("Error:", error);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: " rewardBetForDuck error",
      };
    }
  }
  public async endGame(gameId: string): Promise<ServiceResponse> {
    try {
      if (!gameId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Please fill in all fields",
        };
      }
      const game = this.listGame.find((game) => game.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Game is not found",
        };
      }
      game.gameStatus = "completed";
      const listDucksResponse = await this._roomService.getDucksOfRoom(game.roomId);
      const listDucks = listDucksResponse.data;
      let duckWinner = listDucks[0].id;
      let winnerScore = listDucks[0].score.totalScore;
      listDucks.forEach((duck) => {
        if (duck.score.totalScore > winnerScore) {
          duckWinner = duck.id;
          winnerScore = duck.score.totalScore;
        }
      });
      const listWinner = game.gameBettors.filter((bettor) => bettor.duckId === duckWinner);
      game.winners = listWinner.map((winner) => winner.userId);
      if (game.winners.length > 0) {
        await this._mezonClientService.rewardTokenForUser(game.winners, game.totalBet / game.winners.length);
      } else {
        await this._mezonClientService.rewardTokenForUser(game.bettors, game.totalBet / game.bettors.length);
      }
      return {
        statusCode: 200,
        isSuccess: true,
        data: game,
      };
    } catch (error) {
      logger.error(error?.message);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "Error from server" + error?.message,
      };
    }
  }
}

export default GameService;
