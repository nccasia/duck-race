/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUserHashInfo, User } from "@/interface/user/User";
import userServices from "@/services/userServices";
import { MezonAppEvent, MezonWebViewEvent } from "@/types/webview";
import { Base64 } from "js-base64";
import { useEffect, useState } from "react";

interface GetUserProviderProps {
  children: React.ReactNode;
}
const GetUserProvider = ({ children }: GetUserProviderProps) => {
  const [mezonUser, setMezonUser] = useState<User>();
  const [hashData, setHashData] = useState<IUserHashInfo>();
  useEffect(() => {
    window.Mezon.WebView?.postEvent("PING" as MezonWebViewEvent, { message: "PING" }, () => {
      console.log("PING");
    });
    window.Mezon.WebView?.onEvent("CURRENT_USER_INFO" as MezonAppEvent, (_, userData: any) => {
      if (!userData || !userData.user) {
        return;
      }
      const user = {
        mezonUserId: userData.user?.id,
        id: userData.user?.id,
        playerName: userData.user?.display_name,
        userName: userData.user?.username,
        avatar: userData.user?.avatar_url,
        email: userData?.email,
        wallet: JSON.parse(userData.wallet).value,
      };
      if (user) setMezonUser(user);
    });
    window.Mezon.WebView?.postEvent(
      "SEND_BOT_ID" as MezonWebViewEvent,
      { appId: import.meta.env.VITE_MEZON_APP_ID ?? "" },
      () => {}
    );
    window.Mezon.WebView?.onEvent("USER_HASH_INFO" as MezonAppEvent, async (_, data: any) => {
      const mezonEventData: string | null | undefined = data?.message?.web_app_data;
      if (!mezonEventData) return;
      setHashData({ hashData: Base64.encode(mezonEventData) });
    });
  }, [setHashData, setMezonUser]);
  useEffect(() => {
    if (!mezonUser || !hashData) return;
    const login = async () => {
      const response = await userServices.login({ userData: mezonUser, hashData: hashData.hashData });
      console.log(response);
    };
    login();
  }, [mezonUser, hashData]);
  return <div>{children}</div>;
};
export default GetUserProvider;
