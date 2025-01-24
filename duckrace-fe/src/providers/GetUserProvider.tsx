/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "@/interface/user/User";
import useUserStore from "@/stores/userStore";
import { MezonAppEvent, MezonWebViewEvent } from "@/types/webview";
import { useEffect, useMemo } from "react";

interface GetUserProviderProps {
  children: React.ReactNode;
}
const GetUserProvider = ({ children }: GetUserProviderProps) => {
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const fetchCurrentUser = useMemo(() => {
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    const user: User = {
      id: randomId.toString(),
      name: "Nguyen Văn A " + randomId,
      username: "NguyenVanA " + randomId,
      avatar: "https://avatar.iran.liara.run/public",
      email: `Nva${randomId}@ncc.asia`,
      wallet: 1000000,
    };
    return user;
  }, []);
  useEffect(() => {
    window.Mezon.WebView?.postEvent("PING" as MezonWebViewEvent, { message: "PING" }, () => {
      console.log("PING");
    });
    window.Mezon.WebView?.onEvent("CURRENT_USER_INFO" as MezonAppEvent, (_, userData: any) => {
      if (!userData || !userData.user) {
        return;
      }
      const user = {
        id: userData.user?.id,
        name: userData.user?.display_name,
        username: userData.user?.username,
        avatar: userData.user?.avatar_url,
        email: userData?.email,
        wallet: JSON.parse(userData.wallet).value,
      };
      console.log("user", user);
      if (user) setCurrentUser(user);
    });
    // const user = fetchCurrentUser;
    // if (user) setCurrentUser(user);
  }, [setCurrentUser]);
  return <div>{children}</div>;
};
export default GetUserProvider;
