import { SocketEvents } from "@/constants/SocketEvents";
import useUserStore from "@/stores/userStore";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [socketInitialized, setSocketInitialized] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  useEffect(() => {
    if (currentUser.id && !socketInitialized) {
      socket.current = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true,
        query: {
          userId: currentUser.id,
        },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket");
      });

      socket.current.on(SocketEvents.ON.USER_VISIT_GAME_FAILED, (data) => {
        toast.error(data?.errorMessage);
      });

      setSocketInitialized(true);

      return () => {
        socket.current?.disconnect();
        setSocketInitialized(false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, setCurrentUser]);

  return <SocketContext.Provider value={socket.current}>{children}</SocketContext.Provider>;
};
