export enum ETransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  TRANSFER = "TRANSFER",
}
export interface ITransactionService {
  depositToken(data: DepositTokenRequest): Promise<ServiceResponse>;
  withdrawToken(data: WithdrawTokenRequest): Promise<ServiceResponse>;
  getHistoryTransaction(): Promise<ServiceResponse>;
}
