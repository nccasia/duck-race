import { User } from "@/interface/user/User";
import userServices from "@/services/userServices";
import useUserStore from "@/stores/userStore";
import { setToLocalStorage } from "@/utils/localStorage";
import { Base64 } from "js-base64";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

interface GetUserProviderProps {
  children: React.ReactNode;
}
const GetUserProvider = ({ children }: GetUserProviderProps) => {
  const { setCurrentUser, setAccessToken } = useUserStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const miniAppData = searchParams.get("data");
    if (!miniAppData) {
      return;
    } 

    const login = async () => {
      try {
        const response = await userServices.login({ hashData: Base64.encode(miniAppData) });

        if (!response?.isSuccess) {
          toast.error(response?.errorMessage);
          return;
        }
        setCurrentUser(response.data?.userInfor as User);
        setAccessToken(response.data?.accessToken);
        setToLocalStorage("accessToken", response.data?.accessToken?.token ?? "");
      } catch (error) {
        console.log("Error in GetUserProvider -> login", error);
        // toast.error(error?.message);
      }
    };
    login();
  }, [searchParams, setAccessToken, setCurrentUser]);
  return <div>{children}</div>;
};

export default GetUserProvider;
