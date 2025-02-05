import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SocketEvents } from "@/constants/SocketEvents";
import { AppResponse } from "@/interface/app/AppResponse";
import { Room } from "@/interface/room/Room";
import { useSocket } from "@/providers/SocketProvider";
import useRoomStore from "@/stores/roomStore";
import useUserStore from "@/stores/userStore";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

const ModalCreateRoom = () => {
  const { createRoomData, setCreateRoomData, resetCreateRoomData, openModalCreateRoom, setOpenModalCreateRoom } = useRoomStore();
  const { currentUser } = useUserStore();
  const socket = useSocket();
  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value;
    if (field === "roomBet" && !/^\d*$/.test(value)) {
      return; // Ngăn không cho nhập ký tự không phải số
    }
    const newData = {
      ...createRoomData,
      [field]: value,
    };
    setCreateRoomData(newData);
  };

  const handleOpenModalCreateRoom = useCallback(
    (isOpen: boolean) => {
      setOpenModalCreateRoom(isOpen);
    },
    [setOpenModalCreateRoom]
  );

  const handleCreateNewRoom = () => {
    if (!socket) return;
    if (!createRoomData.roomName || !createRoomData.roomBet || createRoomData.roomBet <= 0) {
      toast.warning("Please fill in all fields");
      return;
    }
    const dataSubmit = {
      ...createRoomData,
      ownerId: currentUser.id,
    };
    socket.emit(SocketEvents.EMIT.CREATE_ROOM, dataSubmit);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEvents.ON.CREATE_ROOM_SUCCESS, (data: AppResponse<Room>) => {
      handleOpenModalCreateRoom(false);
      socket.emit(SocketEvents.EMIT.JOIN_ROOM, {
        roomId: (data.data as Room).roomId,
        userId: currentUser.id,
      });
      resetCreateRoomData();
    });
    socket.on(SocketEvents.ON.CREATE_ROOM_FAILED, (data: AppResponse<null>) => {
      toast.error(data.errorMessage);
    });
    return () => {
      socket.off(SocketEvents.ON.CREATE_ROOM_SUCCESS);
      socket.off(SocketEvents.ON.CREATE_ROOM_FAILED);
    };
  }, [currentUser.id, handleOpenModalCreateRoom, resetCreateRoomData, socket]);

  return (
    <Dialog open={openModalCreateRoom} onOpenChange={handleOpenModalCreateRoom}>
      <DialogTrigger asChild>
        <div
          onClick={() => handleOpenModalCreateRoom(true)}
          className='w-[60px] h-[60px] flex justify-center items-center cursor-pointer absolute top-0 right-2 hover:scale-[0.98] transition-all active:scale-[1.0]'
        >
          <img src='/Buttons/SmallButton.png' />
          <img className='w-[25px] absolute top-[15px] left-[18px]' src='/Icons/PlusIcon.png' />
        </div>
      </DialogTrigger>
      <DialogContent aria-describedby='modal-description' aria-labelledby='modal-title' role='dialog'>
        <DialogTitle className='text-center text-[20px] hidden'>Tạo phòng</DialogTitle>
        <div className='w-[370px] h-[500px] rounded-lg p-10 bg-[url("/Rooms/create-room-modal-bg.png")] bg-center bg-cover font-titan flex justify-center items-center flex-col gap-5'>
          <div className='absolute top-6 w-[230px] h-[80px] rounded-lg flex justify-center items-center bg-[url("/Rooms/room-top.png")] bg-no-repeat bg-center bg-cover '>
            <span className='font-titan text-xl select-none'>Create Room</span>
          </div>
          <div className='flex flex-col gap-4'>
            <div className='w-[220px] h-[70px] relative'>
              <img className='w-full h-full' src='/Rooms/room-input.png' />
              <input
                autoFocus
                value={createRoomData.roomName}
                onChange={(e) => handleChangeValue(e, "roomName")}
                className='absolute w-full h-full top-0 left-0 outline-none bg-[transparent] px-4 text-center'
                placeholder='Room Name'
              />
            </div>
            <div className='w-[220px] h-[70px] relative'>
              <img className='w-full h-full' src='/Rooms/room-input.png' />
              <input
                value={createRoomData.roomBet}
                onChange={(e) => handleChangeValue(e, "roomBet")}
                className='absolute w-full h-full top-0 left-0 outline-none bg-[transparent] px-4 text-center'
                placeholder='Room Bet'
              />
            </div>
            <div
              onClick={handleCreateNewRoom}
              className='w-[150px] h-[70px] mx-auto mt-3 relative cursor-pointer hover:scale-[0.99] transition-all active:scale-[1.0]'
            >
              <img className='w-full' src='/Buttons/Button.png' />
              <span className='absolute top-3 left-0 flex items-center justify-center w-full text-[25px] font-titan'>Save</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalCreateRoom;
