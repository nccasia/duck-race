/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/counterStore.ts
import { IGame, IMezonClan, IMezonUser, IPlayer } from "@/interface/game/Game";
import { create } from "zustand";

interface GameState {
  listPlayer: IPlayer[];
  totalPlayers: number;
  openModalShowUser: boolean;
  addUserText: string;
  currentGame: IGame | null;
  isRacing: boolean | null;
  isCompletedAll: boolean | null;
  isResetGame: boolean;
  gameStatus: "waiting" | "racing" | "completed";
  mezonClanRoles: IMezonClan[];
  selectedClanRole: string | null;
  mezonClanUsers: IMezonUser[];
  listMezonUser: IMezonUser[];

  setListPlayer: (listPlayer: IPlayer[]) => void;
  setTotalPlayers: (totalPlayers: number) => void;
  setOpenModalShowUser: (openModalShowUser: boolean) => void;
  setAddUserText: (addUserText: string) => void;
  setCurrentGame: (currentGame: IGame | null) => void;
  setIsRacing: (isRacing: boolean | null) => void;
  setIsResetGame: (isResetGame: boolean) => void;
  setIsCompletedAll: (isCompletedAll: boolean | null) => void;
  setGameStatus: (gameStatus: "waiting" | "racing" | "completed") => void;
  setMezonClanRoles: (mezonClanRoles: IMezonClan[]) => void;
  setSelectedClanRole: (selectedClanRole: string | null) => void;
  setMezonClanUsers: (mezonClanUsers: IMezonUser[]) => void;
  setListMezonUser: (listMezonUser: IMezonUser[] | []) => void;
}

const useGameStore = create<GameState>((set) => ({
  listPlayer: [],
  totalPlayers: 0,
  openModalShowUser: false,
  addUserText: "",
  currentGame: null,
  isRacing: false,
  isResetGame: false,
  isCompletedAll: null,
  gameStatus: "waiting",
  mezonClanRoles: [],
  selectedClanRole: null,
  mezonClanUsers: [],
  listMezonUser: [],

  setListPlayer: (listPlayer: IPlayer[]) => set({ listPlayer }),
  setTotalPlayers: (totalPlayers: number) => set({ totalPlayers }),
  setOpenModalShowUser: (openModalShowUser: boolean) => set({ openModalShowUser }),
  setAddUserText: (addUserText: string) => set({ addUserText }),
  setCurrentGame: (currentGame: IGame | null) => set({ currentGame }),
  setIsRacing: (isRacing: boolean | null) => set({ isRacing }),
  setIsResetGame: (isResetGame: boolean) => set({ isResetGame }),
  setIsCompletedAll: (isCompletedAll: boolean | null) => set({ isCompletedAll }),
  setGameStatus: (gameStatus: "waiting" | "racing" | "completed") => set({ gameStatus }),
  setMezonClanRoles: (mezonClanRoles: IMezonClan[]) => set({ mezonClanRoles }),
  setSelectedClanRole: (selectedClanRole: string | null) => set({ selectedClanRole }),
  setMezonClanUsers: (mezonClanUsers: IMezonUser[]) => set({ mezonClanUsers }),
  setListMezonUser: (listMezonUser: IMezonUser[] | []) => set({ listMezonUser }),
}));

export default useGameStore;
