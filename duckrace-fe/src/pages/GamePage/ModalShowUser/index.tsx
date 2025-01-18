import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useGameStore from "@/stores/gameStore";
import AddUserTab from "./AddUserTab";
import ListUserTab from "./ListUserTab";
import { useEffect, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { SocketEvents } from "@/constants/SocketEvents";
import { AppResponse } from "@/interface/app/AppResponse";
import { IGame } from "@/interface/game/Game";

const ModalUser = () => {
  const { openModalShowUser, setOpenModalShowUser, setCurrentGame, setListPlayer, setTotalPlayers, setAddUserText, gameStatus } =
    useGameStore();
  const [tabs, setTabs] = useState<string>("list-user");
  const socket = useSocket();

  const handleChangeTab = (tab: string) => {
    setTabs(tab);
  };

  const handleChangeOpenModalShowUser = (isOpen: boolean) => {
    if (gameStatus !== "waiting") {
      return;
    }
    setOpenModalShowUser(isOpen);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEvents.ON.ADD_USER_TO_GAME_FAILED, (data: AppResponse<null>) => {
      console.log(data.errorMessage);
    });
    socket.on(SocketEvents.ON.ADD_USER_TO_GAME_SUCCESS, (data: AppResponse<IGame>) => {
      setCurrentGame(data.data as IGame);
      setListPlayer(data.data?.players || []);
      setTotalPlayers(data.data?.totalPlayers || 0);
      setAddUserText("");
      setTabs("list-user");
    });
    socket.on(SocketEvents.ON.REMOVE_USER_FROM_GAME_SUCCESS, (data: AppResponse<IGame>) => {
      setCurrentGame(data.data as IGame);
      setListPlayer(data.data?.players || []);
      setTotalPlayers(data.data?.totalPlayers || 0);
    });
    socket.on(SocketEvents.ON.REMOVE_USER_FROM_GAME_FAILED, (data: AppResponse<null>) => {
      console.log(data.errorMessage);
    });
    return () => {
      socket.off(SocketEvents.ON.ADD_USER_TO_GAME_FAILED);
      socket.off(SocketEvents.ON.ADD_USER_TO_GAME_SUCCESS);
      socket.off(SocketEvents.ON.REMOVE_USER_FROM_GAME_SUCCESS);
      socket.off(SocketEvents.ON.REMOVE_USER_FROM_GAME_FAILED);
    };
  }, [setAddUserText, setCurrentGame, setListPlayer, setTotalPlayers, socket]);
  return (
    <Dialog open={openModalShowUser} onOpenChange={handleChangeOpenModalShowUser}>
      <DialogTrigger asChild>
        <div className='w-[60px] h-[60px] flex justify-center items-center cursor-pointer absolute top-0 right-2 hover:scale-[0.98] transition-all active:scale-[1.0]'>
          <img src='/Buttons/SmallButton.png' />
          <img className='w-[20px] absolute top-[10px] left-[20px]' src='/Icons/ProfileIcon.png' />
        </div>
      </DialogTrigger>
      <DialogContent aria-describedby='modal-description' aria-labelledby='modal-title' role='dialog'>
        <DialogTitle className='text-center text-[20px] hidden'>Tạo phòng</DialogTitle>
        <div className='w-[700px] h-[500px] rounded-lg p-10 bg-[url("/Window/SmallWindow.png")] bg-center bg-cover flex items-center justify-center'>
          <Tabs value={tabs} onValueChange={(e) => setTabs(e)} className='w-full h-[400px]'>
            <TabsList className='grid w-full grid-cols-2 h-[50px]'>
              <TabsTrigger className='font-titan h-[40px]' value='list-user'>
                Danh sách người chơi
              </TabsTrigger>
              <TabsTrigger className='font-titan h-[40px]' value='add-user'>
                Thêm người chơi
              </TabsTrigger>
            </TabsList>
            <TabsContent
              className='h-[calc(100%-70px)] outline-none p-2 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-red-500 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-track]:bg-gray-200 bg-[#fdfdfd54] rounded-lg select-none'
              value='list-user'
            >
              <ListUserTab handleChangeTab={handleChangeTab} />
            </TabsContent>
            <TabsContent className='h-[calc(100%-70px)] p-2 bg-[#fdfdfd54] rounded-lg select-none' value='add-user'>
              <AddUserTab />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ModalUser;
