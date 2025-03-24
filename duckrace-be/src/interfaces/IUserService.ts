import { GetAccessToken } from "@/entities/User";

export interface IUserService {
  verifyHashUser(hashData: string): Promise<ServiceResponse>;
  getListUsers(): Promise<ServiceResponse>;
  addUser(user: User): Promise<ServiceResponse>;
  removeUser(id: string): Promise<ServiceResponse>;
  getUserById(id: string): Promise<ServiceResponse>;
  getAccessTokenAsync(data: GetAccessToken): Promise<ServiceResponse>;
  // getUserBySocketId(socketId: string): Promise<ServiceResponse>;
  // getSocketIdOfUserAsync(userId: string): Promise<ServiceResponse>;
  // getSocketIdOfUser(userId: string): ServiceResponse;
}
