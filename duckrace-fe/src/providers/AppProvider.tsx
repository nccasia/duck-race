import GetUserProvider from "./GetUserProvider";
import { SocketProvider } from "./SocketProvider";
interface AppProviderProps {
  children: React.ReactNode;
}
const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <>
      <GetUserProvider>
        <SocketProvider>{children}</SocketProvider>
      </GetUserProvider>
    </>
  );
};
export default AppProvider;
