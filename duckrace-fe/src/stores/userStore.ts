// stores/counterStore.ts
import { ITransactionData } from "@/interface/transaction/Transaction";
import { IAccessToken, User } from "@/interface/user/User";
import { create } from "zustand";

interface UserState {
  listUser: User[];
  currentUser: User;
  accessToken?: IAccessToken;
  historyTransaction: ITransactionData[];

  // Function
  setListUser: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  setAccessToken: (accessToken?: IAccessToken) => void;
  changeWallet: (amount: number) => void;
  changeHistoryTransaction: (historyTransaction: ITransactionData[]) => void;
}

const useUserStore = create<UserState>((set) => ({
  listUser: [],
  currentUser: {
    id: "",
    name: "",
    userName: "",
    avatar: "",
    email: "",
    wallet: 0,
  },
  userHashInfo: undefined,
  accessToken: undefined,
  historyTransaction: [],

  // Function
  setListUser: (users: User[]) => set({ listUser: users }),
  setCurrentUser: (user: User) => set({ currentUser: user }),
  changeWallet: (amount: number) => set((state) => ({ currentUser: { ...state.currentUser, wallet: amount } })),
  setAccessToken: (accessToken?: IAccessToken) => set({ accessToken }),
  changeHistoryTransaction: (historyTransaction: ITransactionData[]) => set({ historyTransaction }),
}));

export default useUserStore;
