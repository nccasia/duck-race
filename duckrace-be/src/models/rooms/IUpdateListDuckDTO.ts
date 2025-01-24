import { Duck } from "@/entities/Room";
import { Expose } from "class-transformer";
export class IUpdateListDuckDTO {
  @Expose()
  public roomId: string;
  @Expose()
  public ducks: Duck[];
}
