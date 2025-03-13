export interface IUserService {
  hashUser(user: User, hashKey: string): Promise<ServiceResponse>;
  getListUsersAsync(): Promise<ServiceResponse>;
  getListUsers(): Array<User>;
  addUser(user: User): Promise<ServiceResponse>;
  removeUser(id: string): Promise<ServiceResponse>;
  getUserById(id: string): Promise<ServiceResponse>;
  getUserBySocketId(socketId: string): Promise<ServiceResponse>;
  getSocketIdOfUserAsync(userId: string): Promise<ServiceResponse>;
  getSocketIdOfUser(userId: string): ServiceResponse;
}
