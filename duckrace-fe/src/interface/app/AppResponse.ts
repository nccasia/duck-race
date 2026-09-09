export interface AppResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  data?: T;
}
