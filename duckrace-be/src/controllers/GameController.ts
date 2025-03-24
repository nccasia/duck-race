import { IGameService } from "@/interfaces/IGameService";
import { POST, route } from "awilix-express";
import { Request, Response } from "express";
// DOT NOT REMOVE COMMENTS WHICH START WITH /** @swagger AND END WITH */
// IT'S USED TO GENERATE SWAGGER DOCUMENTS
/**
 * @swagger
 * "tags": {
 *   "name": "Game",
 *   "description": "API for Game"
 * }
 */
@route("/games")
export class RoomController {
  private _gameService: IGameService;
  constructor(GameService: IGameService) {
    this._gameService = GameService;
  }

  @POST()
  @route("/rewards")
  public async rewardToken(req: Request, res: Response) {
    const { winners, winBet } = req.body;
    const result = await this._gameService.rewardToken(winners, winBet);
    return res.json(result);
  }
}
