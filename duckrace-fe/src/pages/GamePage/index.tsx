import { AppResponse } from "@/interface/app/AppResponse";
import { IGame, IMezonClan, IMezonUser, IPlayer } from "@/interface/game/Game";
import { useSocket } from "@/providers/SocketProvider";
import useGameStore from "@/stores/gameStore";
import { useEffect, useRef, useState } from "react";
import ListPlayer from "./ListPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { SocketEvents } from "@/constants/SocketEvents";
import ModalUser from "./ModalShowUser";
import { ROUTES } from "@/routes/path";
import CountdownTime from "./components/CountdownTime";
import useUserStore from "@/stores/userStore";
import ModalShowResult from "./ModalShowResult";
import ModalSetup from "./ModalSetup";
import { MezonAppEvent, MezonWebViewEvent } from "@/types/webview";

const GamePage = () => {
  const socket = useSocket();
  const { gameId } = useParams();
  const navigate = useNavigate();
  const setListPlayer = useGameStore((state) => state.setListPlayer);
  const setTotalPlayer = useGameStore((state) => state.setTotalPlayers);
  const setOpenModalShowUser = useGameStore((state) => state.setOpenModalShowUser);
  const setCurrentGame = useGameStore((state) => state.setCurrentGame);
  const setIsRacing = useGameStore((state) => state.setIsRacing);
  const setIsResetGame = useGameStore((state) => state.setIsResetGame);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const setIsCompletedAll = useGameStore((state) => state.setIsCompletedAll);
  const setMezonClanRoles = useGameStore((state) => state.setMezonClanRoles);
  const setSelectedClanRole = useGameStore((state) => state.setSelectedClanRole);
  const setMezonClanUsers = useGameStore((state) => state.setMezonClanUsers);
  const currentGame = useGameStore((state) => state.currentGame);
  const currentUser = useUserStore((state) => state.currentUser);
  const isRacing = useGameStore((state) => state.isRacing);
  const listPlayer = useGameStore((state) => state.listPlayer);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const [listPlayerToShow, setListPlayerToShow] = useState<IPlayer[]>([]);

  useEffect(() => {
    setOpenModalShowUser(true);
    setIsRacing(false);
    setIsCompletedAll(false);
  }, [setIsCompletedAll, setIsRacing, setOpenModalShowUser]);

  useEffect(() => {
    if (listPlayer.length === 0) {
      return;
    }
    const newList = listPlayer.sort((a, b) => b.score.totalScore - a.score.totalScore);
    setListPlayerToShow(newList.slice(0, 3));
  }, [listPlayer]);
  useEffect(() => {
    console.log("currentGame", currentGame);
  }, [currentGame]);
  useEffect(() => {
    if (!socket) return;
    socket.emit(SocketEvents.EMIT.GET_GAME, gameId);
    socket.on(SocketEvents.ON.GET_GAME_SUCCESS, (data: AppResponse<IGame>) => {
      console.log("GamePage -> data", data);
      setCurrentGame(data.data as IGame);
      setListPlayer(data.data?.players || []);
      setTotalPlayer(data.data?.totalPlayers || 0);
    });
    socket.on(SocketEvents.ON.GET_GAME_FAILED, (data: AppResponse<null>) => {
      console.log("GamePage -> data", data);
    });

    socket.on(SocketEvents.ON.OUT_GAME_SUCCESS, () => {
      setCurrentGame(null);
      setListPlayer([]);
      setTotalPlayer(0);
      navigate(ROUTES.HOME);
    });

    socket.on(SocketEvents.ON.OUT_GAME_FAILED, (data: AppResponse<null>) => {
      console.log("GamePage -> data", data);
      navigate(ROUTES.HOME);
    });

    socket.on(SocketEvents.ON.START_GAME_SUCCESS, (data: AppResponse<IGame>) => {
      setListPlayer(data.data?.players || []);
      setTotalPlayer(data.data?.totalPlayers || 0);
      setIsRacing(true);
      setIsResetGame(false);
      setGameStatus("racing");
      setIsCompletedAll(false);

      if (countdownRef.current) {
        countdownRef.current.startCountdown();
      }
    });
    socket.on(SocketEvents.ON.START_GAME_FAILED, (data: AppResponse<null>) => {
      console.log("GamePage -> data", data);
    });
    socket.on(SocketEvents.ON.START_TURN_SUCCESS, (data: AppResponse<IGame>) => {
      setListPlayer(data.data?.players || []);
      console.log("GamePage -> data", data);
    });
    socket.on(SocketEvents.ON.START_TURN_FAILED, (data: AppResponse<null>) => {
      console.log("GamePage -> data", data);
    });
    socket.on(SocketEvents.ON.RESET_GAME_SUCCESS, (data: AppResponse<IGame>) => {
      console.log("reset game", data);
      setListPlayer(data.data?.players || []);
      setTotalPlayer(data.data?.totalPlayers || 0);
      setIsRacing(false);
      setIsResetGame(true);
      setGameStatus("waiting");
      setIsCompletedAll(false);
      if (countdownRef.current) {
        countdownRef.current.resetCountdown();
      }
    });
    socket.on(SocketEvents.ON.RESET_GAME_FAILED, (data: AppResponse<null>) => {
      console.log("reset game", data);
      console.log("GamePage -> data", data);
    });
    socket.on(SocketEvents.ON.CHANGE_TIME_SUCCESS, (data: AppResponse<IGame>) => {
      setCurrentGame(data.data as IGame);
    });
    socket.on(SocketEvents.ON.CHANGE_TIME_FAILED, (data: AppResponse<null>) => {
      console.log("GamePage -> data", data);
      setCurrentGame(currentGame);
    });
    return () => {
      socket.off(SocketEvents.ON.START_GAME_SUCCESS);
      socket.off(SocketEvents.ON.START_TURN_FAILED);
      socket.off(SocketEvents.ON.START_TURN_SUCCESS);
      socket.off(SocketEvents.ON.START_GAME_FAILED);
      socket.off(SocketEvents.ON.GET_GAME_SUCCESS);
      socket.off(SocketEvents.ON.GET_GAME_FAILED);
      socket.off(SocketEvents.ON.OUT_GAME_SUCCESS);
      socket.off(SocketEvents.ON.OUT_GAME_FAILED);
      socket.off(SocketEvents.ON.RESET_GAME_SUCCESS);
      socket.off(SocketEvents.ON.RESET_GAME_FAILED);
    };
  }, [setListPlayer, setTotalPlayer, socket, gameId, setCurrentGame, navigate]);

  useEffect(() => {
    window.Mezon.WebView?.postEvent("GET_CLAN_USERS" as MezonWebViewEvent, {}, () => {});
    window.Mezon.WebView?.onEvent("CLAN_USERS_RESPONSE" as MezonAppEvent, (_, data) => {
      setMezonClanUsers(data as IMezonUser[]);
    });
    window.Mezon.WebView?.postEvent("GET_CLAN_ROLES" as MezonWebViewEvent, {}, () => {});
    window.Mezon.WebView?.onEvent("CLAN_ROLES_RESPONSE" as MezonAppEvent, (_, data) => {
      setMezonClanRoles(data as IMezonClan[]);
      if ((data as IMezonClan[]).length > 0) {
        setSelectedClanRole((data as IMezonClan[])[0].id);
      }
    });
  }, [setMezonClanRoles, setMezonClanUsers, setSelectedClanRole]);

  const countdownRef = useRef<{ startCountdown: () => void; resetCountdown: () => void }>(null);

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit(SocketEvents.EMIT.START_GAME, {
      gameId,
      userId: currentUser?.id,
    });
  };

  const handleResetGame = () => {
    if (!socket) return;
    socket.emit(SocketEvents.EMIT.RESET_GAME, {
      gameId,
      userId: currentUser?.id,
    });
  };

  const handleOutGame = () => {
    if (!socket) return;
    socket.emit(SocketEvents.EMIT.OUT_GAME, gameId);
  };
  return (
    <div className='h-full w-full bg-[#21107266] rounded-lg relative'>
      <ListPlayer />
      <div className='absolute top-2 left-0 w-full flex justify-center items-center'>
        <div
          onClick={handleOutGame}
          className='w-[60px] h-[60px] flex justify-center items-center cursor-pointer absolute top-0 left-2 hover:scale-[0.98] transition-all active:scale-[1.0]'
        >
          <img src='/Buttons/SmallButton-pressed.png' />
          <img className='w-[30px] absolute top-[12px] left-[12px]' src='/Icons/ExitIcon.png' />
        </div>
        <div
          className='w-[500px] h-[150px] flex justify-center items-center absolute top-0 left-[50%] translate-x-[-50%]'
          style={{ filter: "drop-shadow(0 0 .3rem rgba(124, 6, 226, .874))" }}
        >
          <img className='w-full h-full' src='/Window/SmallSubstrate.png' />
          <div className='w-[150px] h-[55px] justify-center items-center left-[10px] absolute top-[20px] '>
            <img className='w-full h-full' src='/Buttons/Button-hover.png' />
            <CountdownTime ref={countdownRef} initTime={currentGame?.expiredTime} />
          </div>
          {isRacing ? (
            <div
              onClick={handleResetGame}
              className='w-[150px] h-[55px] cursor-pointer justify-center items-center left-[10px] absolute bottom-[10px] filter hover:drop-shadow-[0_0_0.1rem_rgba(124,6,226,0.874)] transition-all active:drop-shadow-[0_0_0.2rem_rgba(124,6,226,0.874)]'
            >
              <img className='w-full h-full' src='/Buttons/Button.png' />
              <div className='flex  justify-center items-center gap-2 text-[30px] font-titan text-white absolute top-1 left-1/2 transform -translate-x-1/2 '>
                <img className='w-[20px] ' src='/Icons/RefreshIcon.png' />
                <span>Reset</span>
              </div>
            </div>
          ) : (
            <div
              onClick={handleStartGame}
              className='w-[150px] h-[55px] cursor-pointer justify-center items-center left-[10px] absolute bottom-[10px] filter hover:drop-shadow-[0_0_0.1rem_rgba(124,6,226,0.874)] transition-all active:drop-shadow-[0_0_0.2rem_rgba(124,6,226,0.874)]'
            >
              <img className='w-full h-full' src='/Buttons/Button.png' />
              <div className='flex  justify-center items-center gap-2 text-[30px] font-titan text-white absolute top-1 left-1/2 transform -translate-x-1/2 '>
                <img className='w-[20px] ' src='/Icons/PlayIcon.png' />
                <span>Start</span>
              </div>
            </div>
          )}
          <div
            style={{ filter: "drop-shadow(0 0 .3rem rgba(124, 6, 226, .874))" }}
            className='w-[300px] h-[130px] justify-center items-center right-[10px] absolute top-[50%] translate-y-[-50%] '
          >
            <img className='w-full h-full' src='/Window/SmallSubstrate.png' />
            <div className=' items-center w-full py-1 px-3 text-[20px] font-titan text-white absolute top-2 left-1/2 transform -translate-x-1/2 '>
              {gameStatus !== "waiting" &&
                listPlayerToShow?.map((player, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <div className="bg-[url('/Icons/StarIcon.png')] flex items-center justify-center bg-center bg-no-repeat bg-cover w-[35px] h-[35px]">
                      {index + 1}
                    </div>
                    <span>{player.name ?? player.user?.display_name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <ModalUser />
        <ModalShowResult onResetGame={handleResetGame} />
        <ModalSetup />
      </div>
      {/* <div className='absolute bottom-0 left-0 right-0 flex justify-center items-center'>
        <button onClick={handleStartGame} className='rounded-full w-[50px] h-[50px] bg-gray-300 text-gray-800 '>
          Start
        </button>
      </div> */}
    </div>
  );
};
export default GamePage;
