type ServiceResponse = {
  statusCode: number;
  isSuccess: boolean;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  data?: any;
};
