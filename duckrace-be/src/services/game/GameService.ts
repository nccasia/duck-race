import {ErrorCodes} from "@/constants/ErrorCodes";
import {BettorOfDucks, Game} from "@/entities/Game";
import logger from "@/helpers/logger";
import {IGameService} from "@/interfaces/IGameService";
import {IMezonClientService} from "@/interfaces/IMezonClientService";
import {IRoomService} from "@/interfaces/IRoomService";
import {IUserService} from "@/interfaces/IUserService";
import {IBetForDuckDTO} from "@/models/games/IBetForDuckDTO";
import {IConfirmBet} from "@/models/games/IConfirmBet";
import {ICreateGameSubmitDTO} from "@/models/games/ICreateGameSubmitDTO";
import {generateId} from "@/utils/generateId";

class GameService implements IGameService {
    private listGame: Game[] = [];
    private _roomService: IRoomService;
    private _userService: IUserService;
    private _mezonClientService: IMezonClientService;

    constructor(UserService: IUserService, RoomService: IRoomService, MezonClientService: IMezonClientService) {
        this._roomService = RoomService;
        this._userService = UserService;
        this._mezonClientService = MezonClientService;
    }

    public async createNewGame(gameData: ICreateGameSubmitDTO): Promise<ServiceResponse> {
        try {
            const roomResponse = await this._roomService.getRoomById(gameData.roomId);
            if (!roomResponse.isSuccess) {
                return {
                    statusCode: 404,
                    isSuccess: false,
                    errorCode: ErrorCodes.ROOM_NOT_FOUND,
                    errorMessage: ErrorCodes.ROOM_NOT_FOUND,
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
                errorCode: ErrorCodes.SERVER_ERROR,
                errorMessage: ErrorCodes.SERVER_ERROR,
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
                    errorCode: ErrorCodes.GAME_NOT_FOUND,
                    errorMessage: ErrorCodes.GAME_NOT_FOUND,
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
                errorCode: ErrorCodes.SERVER_ERROR,
                errorMessage: ErrorCodes.SERVER_ERROR,
            };
        }
    }

    public async betForDuck(betData: IBetForDuckDTO): Promise<ServiceResponse> {
        try {
            if (!betData.gameId || !betData.userId || !betData.ducks) {
                return {
                    statusCode: 400,
                    isSuccess: false,
                    errorCode: ErrorCodes.FILL_ALL_FIELDS,
                    errorMessage: ErrorCodes.FILL_ALL_FIELDS,
                };
            }
            const game = this.listGame.find((game) => game.id === betData.gameId);
            if (!game) {
                return {
                    statusCode: 404,
                    isSuccess: false,
                    errorCode: ErrorCodes.GAME_NOT_FOUND,
                    errorMessage: ErrorCodes.GAME_NOT_FOUND,
                };
            }
            const userInfo = await this._userService.getUserById(betData.userId);
            if (!userInfo.isSuccess) {
                return {
                    statusCode: 404,
                    isSuccess: false,
                    errorCode: ErrorCodes.USER_NOT_FOUND,
                    errorMessage: ErrorCodes.USER_NOT_FOUND,
                };
            }
            if (userInfo.data.wallet < betData.betAmount * betData.ducks.length) {
                return {
                    statusCode: 400,
                    isSuccess: false,
                    errorCode: ErrorCodes.NOT_ENOUGH_TOKEN,
                    errorMessage: ErrorCodes.NOT_ENOUGH_TOKEN,
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

            const updateWalletResponse = await this._userService.updateWalletToken(
                betData.userId,
                -betData.betAmount * betData.ducks.length
            );
            if (!updateWalletResponse.isSuccess) {
                return updateWalletResponse;
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
                errorCode: ErrorCodes.SERVER_ERROR,
                errorMessage: ErrorCodes.SERVER_ERROR,
            };
        }
    }

    public async confirmBetForDuck(confirmBetData: IConfirmBet): Promise<ServiceResponse> {
        try {
            if (!confirmBetData.gameId || !confirmBetData.userId) {
                return {
                    statusCode: 400,
                    isSuccess: false,
                    errorCode: ErrorCodes.FILL_ALL_FIELDS,
                    errorMessage: ErrorCodes.FILL_ALL_FIELDS,
                };
            }
            const game = this.listGame.find((game) => game.id === confirmBetData.gameId);
            if (!game) {
                return {
                    statusCode: 404,
                    isSuccess: false,
                    errorCode: ErrorCodes.GAME_NOT_FOUND,
                    errorMessage: ErrorCodes.GAME_NOT_FOUND,
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
                errorCode: ErrorCodes.SERVER_ERROR,
                errorMessage: ErrorCodes.SERVER_ERROR,
            };
        }
    }

    public async getGameBettors(gameId: string): Promise<ServiceResponse> {
        try {
            if (!gameId) {
                return {
                    statusCode: 400,
                    isSuccess: false,
                    errorCode: ErrorCodes.FILL_ALL_FIELDS,
                    errorMessage: ErrorCodes.FILL_ALL_FIELDS,
                };
            }
            const game = this.listGame.find((game) => game.id === gameId);
            if (!game) {
                return {
                    statusCode: 404,
                    isSuccess: false,
                    errorCode: ErrorCodes.GAME_NOT_FOUND,
                    errorMessage: ErrorCodes.GAME_NOT_FOUND,
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
                errorCode: ErrorCodes.SERVER_ERROR,
                errorMessage: ErrorCodes.SERVER_ERROR,
            };
        }
    }

    public async rewardToken(winners: string[], winBet: number): Promise<ServiceResponse> {
        try {
            if (!winners || winners.length === 0 || !winBet) {
                return {
                    statusCode: 200,
                    isSuccess: true,
                    errorCode: ErrorCodes.NO_ONE_WINS,
                    errorMessage: ErrorCodes.NO_ONE_WINS,
                };
            }
            const result = await Promise.all(
                winners.map(async (winnerId: string) => {
                    const userResponse = await this._userService.getUserById(winnerId);
                    if (!userResponse.isSuccess) {
                        return userResponse;
                    }

                    const updateWalletResponse = await this._userService.updateWalletToken(winnerId, winBet);
                    if (!updateWalletResponse.isSuccess) {
                        return updateWalletResponse;
                    }
                    return {
                        statusCode: 200,
                        isSuccess: true,
                        data: {
                            userId: winnerId,
                            winBet: winBet,
                        },
                    };
                })
            );
            return {
                statusCode: 200,
                isSuccess: true,
                data: result.map((res) => res.data),
            };
        } catch (error) {
            console.error("Error:", error);
            return {
                statusCode: 500,
                isSuccess: false,
                errorCode: ErrorCodes.REWARD_BET_ERROR,
                errorMessage: ErrorCodes.REWARD_BET_ERROR,
            };
        }
    }

    public async endGame(gameId: string): Promise<ServiceResponse> {
        try {
            if (!gameId) {
                return {
                    statusCode: 400,
                    isSuccess: false,
                    errorCode: ErrorCodes.FILL_ALL_FIELDS,
                    errorMessage: ErrorCodes.FILL_ALL_FIELDS,
                };
            }
            const game = this.listGame.find((game) => game.id === gameId);
            if (!game) {
                return {
                    statusCode: 404,
                    isSuccess: false,
                    errorCode: ErrorCodes.GAME_NOT_FOUND,
                    errorMessage: ErrorCodes.GAME_NOT_FOUND,
                };
            }
            game.gameStatus = "completed";
            const listDucksResponse = await this._roomService.getDucksOfRoom(game.roomId);
            const listDucks = listDucksResponse.data;
            const ducksWithTotalScore = listDucks.map((duck: { score: any[]; }) => {
                return {
                    ...duck,
                    totalScore: Array.isArray(duck.score) ? duck.score.reduce((acc: any, score: any) => acc + score, 0) : 0,
                }
            })
            const maxScore = Math.max(...ducksWithTotalScore.map((duck: { totalScore: any; }) => duck.totalScore));

            const duckWinners = ducksWithTotalScore.filter((duck: { totalScore: number; }) => duck.totalScore === maxScore);
            const duckWinnerIds = duckWinners.map((duck: { id: any; }) => duck.id);

            const listWinner = game.gameBettors.filter((bettor) => duckWinnerIds.includes(bettor.duckId));
            game.winners = listWinner.map((winner) => winner.userId);
            if (game.winners.length > 0) {
                await this.rewardToken(game.winners, game.totalBet / game.winners.length);
            } else {
                await this.rewardToken(game.bettors, game.totalBet / game.bettors.length);
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
                errorCode: ErrorCodes.SERVER_ERROR,
                errorMessage: ErrorCodes.SERVER_ERROR,
            };
        }
    }
}

export default GameService;
