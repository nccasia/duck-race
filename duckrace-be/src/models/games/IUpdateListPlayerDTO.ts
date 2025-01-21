import { Player } from "@/entities/Game";
import { Expose } from "class-transformer";
export class IUpdateListPlayerDTO {
  @Expose()
  public gameId: string;
  @Expose()
  public players: Player[];
}
