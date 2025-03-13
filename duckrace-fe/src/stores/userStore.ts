// stores/counterStore.ts
import { IUserHashInfo, User } from "@/interface/user/User";
import { create } from "zustand";

interface UserState {
  listUser: User[];
  currentUser: User;
  userHashInfo?: IUserHashInfo;

  // Function
  setListUser: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  setUserHashInfo: (userHashInfo?: IUserHashInfo) => void;
}

const useUserStore = create<UserState>((set) => ({
  listUser: [],
  currentUser: {
    id: "",
    name: "",
    username: "",
    avatar: "",
    email: "",
    wallet: 0,
  },

  // Function
  setListUser: (users: User[]) => set({ listUser: users }),
  setCurrentUser: (user: User) => set({ currentUser: user }),
  setUserHashInfo: (userHashInfo?: IUserHashInfo) => set({ userHashInfo }),
}));

export default useUserStore;
