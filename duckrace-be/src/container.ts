import { asClass, createContainer, InjectionMode } from "awilix";
import "dotenv/config";
import Application from "./app";
import SocketService from "./services/socket/SocketService";
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

// Register the services
container.register({
  // Register the Services
  Application: asClass(Application).singleton(),
  SocketService: asClass(SocketService).singleton(),
});
export default container;
