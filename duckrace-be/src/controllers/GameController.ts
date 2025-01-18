import { IGameService } from "@/interfaces/IGameService";
import { IRoomService } from "@/interfaces/IRoomService";
import { GET, route } from "awilix-express";
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
}
