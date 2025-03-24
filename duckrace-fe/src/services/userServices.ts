/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppResponse } from "@/interface/app/AppResponse";
import { IGetAccessToken } from "@/interface/user/User";
import http from "@/utils/axios";

const login = async (data: IGetAccessToken): Promise<AppResponse<any>> => {
  try {
    const response: AppResponse<any> = await http.post("/api/users/login", data);
    return response;
  } catch (error) {
    console.log("Error in userServices -> login", error);
    throw error;
  }
};
const userServices = {
  login,
};
export default userServices;
