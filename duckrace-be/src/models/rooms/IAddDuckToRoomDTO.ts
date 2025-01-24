import { Expose } from "class-transformer";
export class IAddDuckToRoomDTO {
  @Expose()
  public roomId: string;
  @Expose()
  public ducks: string[];
}
