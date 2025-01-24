import { Expose } from "class-transformer";
export class IStartGameSubmitDTO {
  @Expose()
  public gameId: string;
  @Expose()
  public roomId: string;
  @Expose()
  public userId: string;
  @Expose()
  public currentGame?: string;
}
