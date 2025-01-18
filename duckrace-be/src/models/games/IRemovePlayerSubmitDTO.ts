import { Expose } from "class-transformer";
export class IRemovePlayerSubmitDTO {
  @Expose()
  public gameId: string;
  @Expose()
  public players: string[];
}
