import { IRoomService } from "@/interfaces/IRoomService";
import { route } from "awilix-express";
// DOT NOT REMOVE COMMENTS WHICH START WITH /** @swagger AND END WITH */
// IT'S USED TO GENERATE SWAGGER DOCUMENTS
/**
 * @swagger
 * "tags": {
 *   "name": "Game",
 *   "description": "API for Game"
 * }
 */
@route("/rooms")
export class RoomController {
  private _roomService: IRoomService;
  constructor(RoomService: IRoomService) {
    this._roomService = RoomService;
  }
}
