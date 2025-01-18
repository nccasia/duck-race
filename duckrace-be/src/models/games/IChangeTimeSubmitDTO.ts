import { Expose } from "class-transformer";
export class IChangeTimeSubmitDTO {
  @Expose()
  public gameId: string;
  @Expose()
  public expiredTime: number;
}
