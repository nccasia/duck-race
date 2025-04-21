import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import { GameService, MezonClientService, UserService } from "./services";
import JwtService from "./services/auth/JWTService";
import PrismaService from "./services/database/PrismaService";
import RoomService from "./services/room/RoomService";
import SocketService from "./services/socket/SocketService";
import TransactionService from "./services/transaction/TransactionService";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  // Register the Services
  UserService: asClass(UserService).scoped(),
  TransactionService: asClass(TransactionService).scoped(),
  RoomService: asClass(RoomService).singleton(),
  JwtService: asClass(JwtService).singleton(),
  PrismaService: asClass(PrismaService).singleton(),
  Application: asClass(Application).singleton(),
  SocketService: asClass(SocketService).singleton(),
  GameService: asClass(GameService).singleton(),
  MezonClientService: asClass(MezonClientService).singleton(),
});
export default container;
