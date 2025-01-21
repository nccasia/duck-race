import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import useGameStore from "@/stores/gameStore";
import { useEffect, useState } from "react";
import { IPlayer } from "@/interface/game/Game";

interface IModalShowResultProps {
  onResetGame: () => void;
}
const ModalShowResult = ({ onResetGame }: IModalShowResultProps) => {
  const { listPlayer, isCompletedAll } = useGameStore();
  const [listPlayerAfterSort, setListPlayerAfterSort] = useState<IPlayer[]>([]);
  const [openModalShowResult, setOpenModalShowResult] = useState(false);
  useEffect(() => {
    const listPlayerNew = [...listPlayer];
    listPlayerNew.sort((a, b) => b.score.totalScore - a.score.totalScore);
    setListPlayerAfterSort(listPlayerNew);
  }, [listPlayer]);

  console.log("listPlayerAfterSort", listPlayerAfterSort);
  useEffect(() => {
    if (isCompletedAll) {
      setOpenModalShowResult(true);
    }
  }, [isCompletedAll]);

  const handleResetGame = () => {
    if (!isCompletedAll) return;
    setOpenModalShowResult(false);
    onResetGame();
  };
  return (
    <Dialog open={openModalShowResult}>
      <DialogTrigger asChild>
        <div
          onClick={() => setOpenModalShowResult(true)}
          className='w-[60px] h-[60px] flex justify-center items-center cursor-pointer absolute top-0 right-[80px] hover:scale-[0.98] transition-all active:scale-[1.0]'
        >
          <img src='/Buttons/SmallButton.png' />
          <img className='w-[25px] absolute top-[10px] left-[18px]' src='/Icons/MedalIcon.png' />
        </div>
      </DialogTrigger>
      <DialogContent aria-describedby='modal-description' aria-labelledby='modal-title' role='dialog'>
        <DialogTitle className='text-center text-[20px] hidden'>Tạo phòng</DialogTitle>
        <div className='w-[350px] h-[600px] rounded-lg p-10 bg-[url("/Window/MenuWindow.png")] bg-center bg-cover font-titan'>
          <div className='h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-red-500 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-track]:bg-gray-200'>
            {listPlayerAfterSort.map((player) => (
              <div className='flex items-center gap-2 py-2 border-b-2 border-[#21107266]' key={player.id}>
                <div className="bg-[url('/Icons/StarIcon.png')] flex items-center justify-center bg-center bg-no-repeat bg-cover w-[45px] h-[45px]">
                  {player.order}
                </div>
                <span>{player.name ?? player.user?.display_name}</span>
              </div>
            ))}
          </div>
          <div className='flex justify-center items-center gap-2 mt-5'>
            {isCompletedAll ? (
              <div
                onClick={handleResetGame}
                className='w-[150px] h-[55px] cursor-pointer justify-center items-center relative filter hover:drop-shadow-[0_0_0.1rem_rgba(124,6,226,0.874)] transition-all active:drop-shadow-[0_0_0.2rem_rgba(124,6,226,0.874)]'
              >
                <img className='w-full h-full' src='/Buttons/Button.png' />
                <div className='flex  justify-center items-center gap-2 text-[30px] font-titan text-white absolute top-1 left-1/2 transform -translate-x-1/2 '>
                  <img className='w-[20px] ' src='/Icons/RefreshIcon.png' />
                  <span>Reset</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setOpenModalShowResult(false)}
                className='w-[150px] h-[55px] cursor-pointer justify-center items-center relative filter hover:drop-shadow-[0_0_0.1rem_rgba(124,6,226,0.874)] transition-all active:drop-shadow-[0_0_0.2rem_rgba(124,6,226,0.874)]'
              >
                <img className='w-full h-full' src='/Buttons/Button-pressed.png' />
                <div className='flex  justify-center items-center gap-2 text-[30px] font-titan text-white absolute top-1 left-1/2 transform -translate-x-1/2 '>
                  <img className='w-[20px] ' src='/Icons/RefreshIcon.png' />
                  <span>Close</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ModalShowResult;
