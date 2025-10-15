import { IMezonClientService } from "@/interfaces/IMezonClientService";
import { MezonClient, TokenSentEvent } from "mezon-sdk";

class MezonClientService implements IMezonClientService {
  private client: MezonClient;
  constructor() {}

  public async authenticate(): Promise<void> {
    const clientId = process.env.MEZON_APP_ID;
    const token = process.env.MEZON_APP_TOKEN;
    if (!clientId || !token) {
      throw new Error("Mezon APP ID or TOKEN is not defined");
    }

    this.client = new MezonClient({
      botId: clientId,
      token: token,
    });
    await this.client.login().then((res) => {
      console.log("MezonClientService login success: ", res);
    }).catch((err) => {
      console.error("MezonClientService login error", err);
      throw err;
    });
  }

  public getClient(): MezonClient {
    return this.client;
  }

  public async rewardTokenForUser(
    winners: string[],
    winBet: number
  ): Promise<ServiceResponse> {
    try {
      for (let i = 0; i < winners.length; i++) {
        const sendTokenData: TokenSentEvent = {
          sender_id: process.env.MEZON_APP_ID,
          sender_name: "DUCKRACE-BOT",
          receiver_id: winners[i],
          amount: Math.floor(winBet),
          note: "You win the game",
        };
        await this.client.sendToken(sendTokenData);
      }
      return {
        statusCode: 200,
        isSuccess: true,
        errorMessage: "",
      };
    } catch (error) {
      console.error("Error:", error);
      return {
        statusCode: 500,
        isSuccess: false,
        errorMessage: "rewardBetForDuck error",
      };
    }
  }
}
export default MezonClientService;
