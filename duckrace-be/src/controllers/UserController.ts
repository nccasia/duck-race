import { IUserService } from "@/interfaces/IUserService";
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
@route("/users")
export class UserController {
  private _userService: IUserService;
  constructor(UserService: IUserService) {
    this._userService = UserService;
  }

  @POST()
  @route("/login")
  public async login(req: Request, res: Response) {
    const result = await this._userService.getAccessTokenAsync(req.body);
    return res.json(result);
  }
}
