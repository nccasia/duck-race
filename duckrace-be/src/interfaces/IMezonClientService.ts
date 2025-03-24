export interface IMezonClientService {
  authenticate(): Promise<any>;
  rewardTokenForUser(winners: string[], winBet: number): Promise<ServiceResponse>;
}
