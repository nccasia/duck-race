class DepositTokenRequest {
  public userId: string;
  public amount: number;
}

class WithdrawTokenRequest {
  public userId: string;
  public amount: number;
}

class TransactionData {
  public userId: string;
  public amount: number;
  public type: string;
  public isIncrease: boolean;
  public note: string;
}
