import { User } from "@/interface/user/User";
import useUserStore from "@/stores/userStore";
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
    const user = fetchCurrentUser;
    if (user) setCurrentUser(user);
  }, [fetchCurrentUser, setCurrentUser]);
  return <div>{children}</div>;
};
export default GetUserProvider;
