import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SocketEvents } from "@/constants/SocketEvents";
import { useSocket } from "@/providers/SocketProvider";
import useGameStore from "@/stores/gameStore";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface TimeInput {
  position1: number;
  position2: number;
  position3: number;
  position4: number;
}

const ModalSearchRoom = () => {
  const { t } = useTranslation();
  const [openModalSearchRoom, setOpenModalSearchRoom] = useState(false);
  const { currentGame, gameStatus } = useGameStore();
  const socket = useSocket();

  const [timeInput, setTimeInput] = useState<TimeInput>({
    position1: 0,
    position2: 0,
    position3: 0,
    position4: 0,
  });

  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // if (currentGame) {
    //   const time = currentGame.expiredTime;
    //   ...
    // }
  }, [currentGame]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, position: number) => {
    const value = e.key;

    if (/^\d$/.test(value)) {
      setTimeInput((prev) => ({
        ...prev,
        [`position${position}`]: parseInt(value),
      }));

      const nextInput = inputRefs.current[position];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const convertTimeInputToSeconds = (timeInput: TimeInput) => {
    const minutes = timeInput.position1 * 10 + timeInput.position2;
    const seconds = timeInput.position3 * 10 + timeInput.position4;
    return minutes * 60 + seconds;
  };

  const handleSaveTime = () => {
    const time = convertTimeInputToSeconds(timeInput);
    if (!socket) return;
    socket.emit(SocketEvents.EMIT.CHANGE_TIME, {
      gameId: currentGame?.id,
      expiredTime: time,
    });
    setOpenModalSearchRoom(false);
  };

  const handleOpenModalSearchRoom = (isOpen: boolean) => {
    if (gameStatus !== "waiting" && isOpen) {
      return;
    }
    setOpenModalSearchRoom(isOpen);
  };

  return (
    <Dialog open={openModalSearchRoom} onOpenChange={handleOpenModalSearchRoom}>
      <DialogTrigger asChild>
        <div
          onClick={() => handleOpenModalSearchRoom(true)}
          className='w-[60px] h-[60px] flex justify-center items-center cursor-pointer absolute top-0 right-[80px] hover:scale-[0.98] transition-all active:scale-[1.0]'
        >
          <img src='/Buttons/SmallButton.png' />
          <img className='w-[25px] absolute top-[10px] left-[18px]' src='/Icons/QuestionIcon.png' />
        </div>
      </DialogTrigger>
      <DialogContent aria-describedby='modal-description' aria-labelledby='modal-title' role='dialog'>
        <DialogTitle className='text-center text-[20px] hidden'>{t("common.time")}</DialogTitle>
        <div className='w-[350px] h-[350px] rounded-lg p-10 bg-[url("/countdown.png")] bg-center bg-cover font-titan flex justify-center items-center flex-col gap-5'>
          <div className='text-center text-[30px]'>{t("common.time")}</div>
          <div className='flex items-center justify-center gap-5 relative'>
            {[1, 2, 3, 4].map((position, index) => (
              <input
                key={position}
                ref={(el) => (inputRefs.current[index] = el!)}
                maxLength={1}
                onKeyDown={(e) => handleKeyDown(e, position)}
                value={timeInput[`position${position}` as keyof TimeInput]}
                type='text'
                className='w-[40px] bg-gray-600 text-white h-[50px] text-center text-[30px] font-titan border-2 border-gray-500 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            ))}
            <span className='text-white h-[50px] text-center text-[30px] font-titan absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'>
              :
            </span>
          </div>
          <div className='flex justify-center items-center gap-2'>
            <div className='w-[150px] h-[55px] cursor-pointer justify-center items-center relative filter hover:drop-shadow-[0_0_0.1rem_rgba(124,6,226,0.874)] transition-all active:drop-shadow-[0_0_0.2rem_rgba(124,6,226,0.874)]'>
              <img className='w-full h-full' src='/Buttons/Button-pressed.png' />
              <div
                onClick={handleSaveTime}
                className='flex justify-center items-center gap-2 text-[30px] font-titan text-white absolute top-1 left-1/2 transform -translate-x-1/2'
              >
                <span>{t("common.save")}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSearchRoom;
