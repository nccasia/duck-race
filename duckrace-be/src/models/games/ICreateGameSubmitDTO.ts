import { Expose } from "class-transformer";
export class ICreateGameSubmitDTO {
  @Expose()
  public userId: string;
  @Expose()
  public roomId: string;
}
