// stores/counterStore.ts
import { BettorOfDucks, DuckPicked, IGame, IGameResult } from "@/interface/game/Game";
import { create } from "zustand";

interface RaceProgress {
    turn: number;
    maxTurns: number;
}

interface GameState {
  currentGame: IGame | null;
  isRacing: boolean | null;
  isCompletedAll: boolean | null;
  isResetGame: boolean;
  gameStatus: "waiting" | "betting" | "confirming" | "racing" | "completed";
  maxScore: number | null;
    raceProgress: RaceProgress;
  openModalBet: boolean;
  listBettorOfDucks: BettorOfDucks[];
  listDuckPicked: DuckPicked[];
  gameResult: IGameResult | null;
  isConfirmedBet: boolean;

  setCurrentGame: (currentGame: IGame | null) => void;
  setIsRacing: (isRacing: boolean | null) => void;
  setIsResetGame: (isResetGame: boolean) => void;
  setIsCompletedAll: (isCompletedAll: boolean | null) => void;
  setGameStatus: (gameStatus: "waiting" | "betting" | "confirming" | "racing" | "completed") => void;
  setMaxScore: (maxScore: number | null) => void;
  setRaceProgress: (raceProgress: RaceProgress) => void;
  setOpenModalBet: (openModalBet: boolean) => void;
  setListBettorOfDucks: (listBettorOfDucks: BettorOfDucks[]) => void;
  setListDuckPicked: (listDuckPicked: DuckPicked[]) => void;
  setGameResult: (gameResult: IGameResult | null) => void;
  setIsConfirmedBet: (isConfirmedBet: boolean) => void;
}

const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  isRacing: false,
  isResetGame: false,
  isCompletedAll: null,
  gameStatus: "waiting",
  maxScore: null,
  raceProgress: {
    turn: 0,
    maxTurns: 0
  },
  openModalBet: false,
  listBettorOfDucks: [],
  listDuckPicked: [],
  gameResult: null,
  isConfirmedBet: false,

  setCurrentGame: (currentGame: IGame | null) => set({ currentGame }),
  setIsRacing: (isRacing: boolean | null) => set({ isRacing }),
  setIsResetGame: (isResetGame: boolean) => set({ isResetGame }),
  setIsCompletedAll: (isCompletedAll: boolean | null) => set({ isCompletedAll }),
  setGameStatus: (gameStatus: "waiting" | "betting" | "confirming" | "racing" | "completed") => set({ gameStatus }),
  setRaceProgress: (raceProgress: RaceProgress) => set({ raceProgress }),
  setOpenModalBet: (openModalBet: boolean) => set({ openModalBet }),
  setListBettorOfDucks: (listBettorOfDucks: BettorOfDucks[]) => set({ listBettorOfDucks }),
  setListDuckPicked: (listDuckPicked: DuckPicked[]) => set({ listDuckPicked }),
  setGameResult: (gameResult: IGameResult | null) => set({ gameResult }),
  setIsConfirmedBet: (isConfirmedBet: boolean) => set({ isConfirmedBet }),
  setMaxScore: (maxScore: number | null) => set({ maxScore }),
}));

export default useGameStore;
