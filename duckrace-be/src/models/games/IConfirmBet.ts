import { Expose } from "class-transformer";
export class IConfirmBet {
  @Expose()
  public userId: string;
  @Expose()
  public gameId: string;
}
