import { ROUTES } from "@/routes/path";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const handleStartGame = () => {
    navigate(ROUTES.ROOM);
  };
  return (
    <div className='h-full w-full bg-gradient-to-b from-teal-100 via-teal-300 to-teal-200 bg-center bg-no-repeat rounded-lg p-2 relative flex justify-center items-center '>
      <div className='flex justify-center items-center relative w-[600px] h-[600px]'>
        <img src='/bg-home.png' alt='duck' className='w-full' />
        <span
          onClick={handleStartGame}
          className='font-titan absolute text-[65px] top-[75px] left-[130px] rotate-[-4deg] cursor-pointer hover:text-blue-400 select-none transition-all active:scale-[1.02]'
        >
          Start
        </span>
        <span className='font-titan absolute text-[55px] top-[192px] left-[90px] rotate-[-4deg] select-none'>Duck </span>
        <span className='font-titan absolute text-[55px] top-[240px] left-[170px] rotate-[-4deg] select-none'>Race</span>
      </div>
    </div>
  );
};
export default HomePage;
