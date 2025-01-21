import { IGameService } from "@/interfaces/IGameService";
import logger from "@/helpers/logger";
import { generateId } from "@/utils/generateId";
import { Game, Player } from "@/entities/Game";
import { IAddPlayerSubmitDTO } from "@/models/games/IAddPlayerSubmitDTO";
import { IRemovePlayerSubmitDTO } from "@/models/games/IRemovePlayerSubmitDTO";
import { IStartGameSubmitDTO } from "@/models/games/IStartGameSubmitDTO";
import { IChangeTimeSubmitDTO } from "@/models/games/IChangeTimeSubmitDTO";
import { IUpdateListPlayerDTO } from "@/models/games/IUpdateListPlayerDTO";

class GameService implements IGameService {
  private static instance: GameService;
  private listGame: Game[] = [];
  private constructor() {}

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  private randomUserArray(players: Player[]): Player[] {
    // Implementation here
    const randomUserArray = [...players].sort(() => Math.random() - 0.5);
    return randomUserArray;
  }

  public checkGameCompleted(gameId: string): boolean {
    const currentGame = this.listGame.find((game) => game.id === gameId);
    if (!currentGame) return true;
    // Implementation here
    if (currentGame.currentTime >= currentGame.expiredTime) {
      currentGame.status = "completed";
      return true;
    }
    return false;
  }

  private updateScoreOfPlayer(gameId: string, playerId: string, score: number): void {
    // Implementation here
    const currentGame = this.listGame.find((game) => game.id === gameId);
    const player = currentGame?.players.find((player) => player.id === playerId);
    if (player) {
      player.score.oldScore = player.score.totalScore;
      player.score.totalScore += score;
      player.score.newScore = player.score.totalScore;
    }
  }

  private updateCurrentTimeOfGame(gameId: string, currentTime?: number): void {
    const currentGame = this.listGame.find((game) => game.id === gameId);
    if (!currentGame) return;
    if (currentTime) {
      currentGame.currentTime = currentTime;
    } else {
      currentGame.currentTime++;
    }
  }

  public async createNewGame(ownerId: string): Promise<ServiceResponse> {
    try {
      const roomId = generateId(10, "mixed");
      const game = new Game();
      game.id = roomId;
      game.ownerId = ownerId;
      game.currentTime = 0;
      game.expiredTime = 60;
      game.players = [];
      game.totalPlayers = 0;
      game.status = "waiting";
      this.listGame.push(game);
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

  public async removeGame(gameId: string): Promise<ServiceResponse> {
    try {
      this.listGame = this.listGame.filter((game) => game.id !== gameId);
      return {
        statusCode: 200,
        isSuccess: true,
        data: null,
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

  public async changeTimeOfGame(changeTimeData: IChangeTimeSubmitDTO): Promise<ServiceResponse> {
    try {
      const currentGame = this.listGame.find((game) => game.id === changeTimeData.gameId);
      if (!currentGame) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      console.log("changeTimeData", changeTimeData);
      currentGame.expiredTime = changeTimeData.expiredTime;
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentGame,
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

  public async addPlayerToGame(addPlayerData: IAddPlayerSubmitDTO): Promise<ServiceResponse> {
    try {
      const game = this.listGame.find((game) => game.id === addPlayerData.gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      const playerNumber = game.players.length;
      addPlayerData.players.forEach((player, index) => {
        if (player?.trim() !== "") {
          game.players.push({
            id: generateId(10, "mixed"),
            name: player?.trim(),
            score: { oldScore: 0, newScore: 0, totalScore: 0 },
            order: playerNumber + index + 1,
          });
        }
      });
      game.totalPlayers = game.players.length;
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

  public async updateUserOfGame(updateUserData: IUpdateListPlayerDTO): Promise<ServiceResponse> {
    try {
      const currentGame = this.listGame.find((game) => game.id === updateUserData.gameId);
      if (!currentGame) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      updateUserData.players.forEach((player, index) => {
        player.score = { oldScore: 0, newScore: 0, totalScore: 0 };
        player.order = index + 1;
      });
      currentGame.players = updateUserData.players;
      currentGame.totalPlayers = updateUserData.players.length;
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentGame,
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

  public async removePlayerFromGame(removeUserData: IRemovePlayerSubmitDTO): Promise<ServiceResponse> {
    try {
      console.log("data", removeUserData);
      const game = this.listGame.find((game) => game.id === removeUserData.gameId);
      if (!game) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      game.players = game.players.filter((player) => !removeUserData.players.includes(player.id));
      game.totalPlayers = game.players.length;
      game.players.forEach((player, index) => {
        player.order = index + 1;
      });
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

  public async resetGame(resetGameData: IStartGameSubmitDTO): Promise<ServiceResponse> {
    try {
      const currentGame = this.listGame.find((game) => game.id === resetGameData.gameId);
      if (!currentGame) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      currentGame.players.forEach((player) => {
        player.score = { oldScore: 0, newScore: 0, totalScore: 0 };
      });
      currentGame.currentTime = 0;
      currentGame.status = "waiting";
      return {
        statusCode: 200,
        isSuccess: true,
        data: currentGame,
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

  public async startNewGame(startGameData: IStartGameSubmitDTO): Promise<ServiceResponse> {
    try {
      const currentGame = this.listGame.find((game) => game.id === startGameData.gameId);
      if (!currentGame) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }
      if (currentGame.players.length < 2) {
        return {
          statusCode: 400,
          isSuccess: false,
          errorMessage: "Phải có ít nhất 2 người để chơi",
        };
      }
      const resetGameResponse = await this.resetGame(startGameData);
      if (!resetGameResponse.isSuccess) {
        return resetGameResponse;
      }
      currentGame.status = "racing";
      return {
        statusCode: 201,
        isSuccess: true,
        data: resetGameResponse.data,
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

  public async startTurn(gameId: string): Promise<ServiceResponse> {
    try {
      const currentGame = this.listGame.find((game) => game.id === gameId);
      if (!currentGame) {
        return {
          statusCode: 404,
          isSuccess: false,
          errorMessage: "Không tìm thấy game",
        };
      }

      const players = currentGame.players;
      const randomUserArray = this.randomUserArray(players);
      const startScore = 1;
      const endScore = 6;
      let score = startScore;
      randomUserArray?.forEach((player, index) => {
        let turnScore = score + (index % 6);
        if (turnScore > endScore) {
          turnScore = startScore;
          score = startScore;
        }
        this.updateScoreOfPlayer(currentGame.id, player.id, turnScore);
      });
      this.updateCurrentTimeOfGame(currentGame.id);
      const gameAfterTurn = this.listGame.find((game) => game.id === gameId);
      return {
        statusCode: 200,
        isSuccess: true,
        data: gameAfterTurn,
        message: "COMPLETED-GAME",
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

export default GameService;
