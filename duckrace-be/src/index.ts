import "module-alias/register";
import Application from "./app";
import container from "./container";
import SocketService from "./services/socket/SocketService";
container.resolve<Application>("Application");
container.resolve<SocketService>("SocketService");
