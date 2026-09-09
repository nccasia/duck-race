import { User } from "@/interface/user/User";
import userServices from "@/services/userServices";
import useUserStore from "@/stores/userStore";
import { getMezonInitData } from "@/utils/mezon/getInitData";
import { setToLocalStorage } from "@/utils/localStorage";
import { Base64 } from "js-base64";
import { translateError } from "@/i18n/translateError";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface GetUserProviderProps {
  children: React.ReactNode;
}

const GetUserProvider = ({ children }: GetUserProviderProps) => {
  const { t } = useTranslation();
  const { setCurrentUser, setAccessToken } = useUserStore();
  const hasLoggedIn = useRef(false);

  useEffect(() => {
    if (hasLoggedIn.current) {
      return;
    }

    const miniAppData = getMezonInitData();
    if (!miniAppData) {
      console.warn(`[Auth] ${t("auth.noMezonData")}`);
      return;
    }

    hasLoggedIn.current = true;

    const login = async () => {
      try {
        const response = await userServices.login({ hashData: Base64.encode(miniAppData) });

        if (!response?.isSuccess) {
          toast.error(translateError(response) || t("auth.loginFailed"));
          hasLoggedIn.current = false;
          return;
        }

        setCurrentUser(response.data?.userInfor as User);
        setAccessToken(response.data?.accessToken);
        setToLocalStorage("accessToken", response.data?.accessToken?.token ?? "");
      } catch (error) {
        console.log("Error in GetUserProvider -> login", error);
        hasLoggedIn.current = false;
      }
    };

    login();
  }, [setAccessToken, setCurrentUser, t]);

  return <>{children}</>;
};

export default GetUserProvider;
