/* eslint-disable @typescript-eslint/no-explicit-any */
import useUserStore from "@/stores/userStore";
import { MezonAppEvent, MezonWebViewEvent } from "@/types/webview";
import { Base64 } from "js-base64";
import { useEffect } from "react";

interface GetUserProviderProps {
  children: React.ReactNode;
}
const GetUserProvider = ({ children }: GetUserProviderProps) => {
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setUserHashInfo = useUserStore((state) => state.setUserHashInfo);
  // const fetchCurrentUser = useMemo(() => {
  //   const user: User = {
  //     id: getFromLocalStorage("mezonUserId") ?? "a",
  //     name: getFromLocalStorage("userName") ?? "Nguyen Van A",
  //     username: getFromLocalStorage("userName") ?? "NguyenVanA",
  //     avatar: "https://avatar.iran.liara.run/public",
  //     email: getFromLocalStorage("email") ?? "",
  //     wallet: 1000000,
  //   };
  //   return user;
  // }, []);
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
        userName: userData.user?.username,
        avatar: userData.user?.avatar_url,
        email: userData?.email,
        wallet: JSON.parse(userData.wallet).value,
      };
      if (user) setCurrentUser(user);
    });
    window.Mezon.WebView?.postEvent(
      "SEND_BOT_ID" as MezonWebViewEvent,
      { appId: import.meta.env.VITE_MEZON_APP_ID ?? "" },
      () => {}
    );
    window.Mezon.WebView?.onEvent("USER_HASH_INFO" as MezonAppEvent, async (_, data: any) => {
      const mezonEventData: string | null | undefined = data?.message?.web_app_data;
      if (!mezonEventData) return;
      setUserHashInfo({ hashData: Base64.encode(mezonEventData) });
    });
    // const user = fetchCurrentUser;
    // console.log("user", user);
    // if (user) setCurrentUser(user);
  }, [setCurrentUser, setUserHashInfo]);
  return <div>{children}</div>;
};
export default GetUserProvider;
