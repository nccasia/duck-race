import { Expose } from "class-transformer";
export class IChangeTimeSubmitDTO {
  @Expose()
  public roomId: string;
  @Expose()
  public expiredTime: number;
}
