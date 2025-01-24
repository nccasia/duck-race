import { IGameService } from "@/interfaces/IGameService";
import logger from "@/helpers/logger";
import { generateId } from "@/utils/generateId";
import { BettorOfDucks, Game } from "@/entities/Game";
import { ICreateGameSubmitDTO } from "@/models/games/ICreateGameSubmitDTO";
import { IBetForDuckDTO } from "@/models/games/IBetForDuckDTO";
import { IRoomService } from "@/interfaces/IRoomService";
import RoomService from "../room/RoomService";
import { IUserService } from "@/interfaces/IUserService";
import UserService from "../user/UserService";
import { IConfirmBet } from "@/models/games/IConfirmBet";

class GameService implements IGameService {
  private static instance: GameService;
  private listGame: Game[] = [];
  private _roomService: IRoomService;
  private _userService: IUserService;
  private constructor() {
    this._roomService = RoomService.getInstance();
    this._userService = UserService.getInstance();
  }

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
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
          errorMessage: "Không tìm thấy phòng",
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
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public async getGameById(gameId: string): Promise<ServiceResponse> {
    try {
      console.log("gameId", gameId);
      const game = this.listGame.find((game) => game.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
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
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public async betForDuck(betData: IBetForDuckDTO): Promise<ServiceResponse> {
    try {
      console.log("betData", betData);
      if (!betData.gameId || !betData.userId || !betData.ducks) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Dữ liệu không hợp lệ",
        };
      }
      const game = this.listGame.find((game) => game.id === betData.gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
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
        errorMessage: "Lỗi từ hệ thống" + error?.message,
      };
    }
  }

  public async confirmBetForDuck(confirmBetData: IConfirmBet): Promise<ServiceResponse> {
    try {
      if (!confirmBetData.gameId || !confirmBetData.userId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Dữ liệu không hợp lệ",
        };
      }
      const game = this.listGame.find((game) => game.id === confirmBetData.gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
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
        errorMessage: "Lỗi từ hệ thống",
      };
    }
  }

  public async getGameBettors(gameId: string): Promise<ServiceResponse> {
    try {
      if (!gameId) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Dữ liệu không hợp lệ",
        };
      }
      const game = this.listGame.find((game) => game.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      const listUser = this._userService.getListUsers();
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
        errorMessage: "Lỗi từ hệ thống" + error?.message,
      };
    }
  }

  private async rewardBetForDuck(currentGameId: string, winners: string[], winBet: number): Promise<ServiceResponse> {
    if (!winners || winners.length === 0) {
      return {
        statusCode: 200,
        isSuccess: true,
        errorMessage: "Không có người thắng cuộc",
      };
    }
    const API_KEY = process.env.API_KEY ?? "";
    const APP_ID = process.env.APP_ID ?? "";
    const url = process.env.REWARD_URL ?? "";
    const headers = {
      apiKey: API_KEY,
      appId: APP_ID,
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
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Result:", result);
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
          errorMessage: "Dữ liệu không hợp lệ",
        };
      }
      const game = this.listGame.find((game) => game.id === gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
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
        await this.rewardBetForDuck(gameId, game.winners, game.totalBet / game.winners.length);
      } else {
        await this.rewardBetForDuck(gameId, game.bettors, game.totalBet / game.bettors.length);
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
        errorMessage: "Lỗi từ hệ thống" + error?.message,
      };
    }
  }
}

export default GameService;
