import { Expose } from "class-transformer";
export class IAddPlayerSubmitDTO {
  @Expose()
  public gameId: string;
  @Expose()
  public players: string[];
}
