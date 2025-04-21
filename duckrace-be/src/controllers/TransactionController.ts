import { ITransactionService } from "@/interfaces/ITransactionService";
import AuthenticateMiddleware from "@/middlewares/AuthenticateMiddleware";
import { before, GET, inject, POST, route } from "awilix-express";
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

@before(inject((JwtService) => AuthenticateMiddleware(JwtService)))
@route("/transactions")
export class TransactionController {
  private _transactionService: ITransactionService;
  constructor(TransactionService: ITransactionService) {
    this._transactionService = TransactionService;
  }

  @POST()
  @route("/deposit")
  public async login(req: Request, res: Response) {
    const result = await this._transactionService.depositToken(req.body);
    return res.json(result);
  }

  @POST()
  @route("/withdraw")
  public async withdraw(req: Request, res: Response) {
    const result = await this._transactionService.withdrawToken(req.body);
    return res.json(result);
  }

  @GET()
  @route("/history")
  public async getHistoryTransaction(req: Request, res: Response) {
    const result = await this._transactionService.getHistoryTransaction();
    return res.json(result);
  }
}
