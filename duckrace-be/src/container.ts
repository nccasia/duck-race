import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import { GameService, MezonClientService, UserService } from "./services";
import PrismaService from "./services/database/PrismaService";
import SocketService from "./services/socket/SocketService";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  // Register the Services
  UserService: asClass(UserService).scoped(),
  PrismaService: asClass(PrismaService).singleton(),
  Application: asClass(Application).singleton(),
  SocketService: asClass(SocketService).singleton(),
  GameService: asClass(GameService).singleton(),
  MezonClientService: asClass(MezonClientService).singleton(),
});
export default container;
