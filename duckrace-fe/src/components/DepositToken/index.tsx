import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import InstructionTab from "./InstructionTab";

interface DepositTokenProps {
  openModalDeposit: boolean;
  setOpenModalDeposit: (value: boolean) => void;
}

const DepositToken = ({ openModalDeposit, setOpenModalDeposit }: DepositTokenProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={openModalDeposit} onOpenChange={setOpenModalDeposit}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent aria-describedby='modal-description' aria-labelledby='modal-title' role='dialog'>
        <DialogTitle id='modal-title' className='hidden'>
          {t("wallet.deposit")}
        </DialogTitle>
        <div className='w-[550px] h-[400px] rounded-lg p-10 bg-[url("/Window/SmallWindow.png")] bg-center bg-cover flex items-center justify-center'>
          <div className='w-full h-[320px] outline-none p-2 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-red-500 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-track]:bg-gray-200 bg-[#fdfdfd54] rounded-lg select-none'>
            <InstructionTab />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositToken;
