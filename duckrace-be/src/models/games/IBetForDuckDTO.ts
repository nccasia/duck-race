import { Expose } from "class-transformer";
export class IBetForDuckDTO {
  @Expose()
  public userId: string;
  @Expose()
  public roomId: string;
  @Expose()
  public gameId: string;
  @Expose()
  public ducks: string[];
  @Expose()
  public betAmount: number;
}
