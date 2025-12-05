import { BrowserRouter } from "react-router-dom";
import GetUserProvider from "./GetUserProvider";
import { SocketProvider } from "./SocketProvider";
interface AppProviderProps {
  children: React.ReactNode;
}
const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <BrowserRouter>
      <GetUserProvider>
        <SocketProvider>{children}</SocketProvider>
      </GetUserProvider>
    </BrowserRouter>
  );
};
export default AppProvider;
