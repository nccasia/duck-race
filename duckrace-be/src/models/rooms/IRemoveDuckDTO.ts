import { Expose } from "class-transformer";
export class IRemoveDuckDTO {
  @Expose()
  public roomId: string;
  @Expose()
  public ducks: string[];
}
