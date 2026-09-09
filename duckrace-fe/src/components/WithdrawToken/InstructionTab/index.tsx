import { useTranslation } from "react-i18next";

const InstructionTab = () => {
  const { t } = useTranslation();

  return (
    <div className=''>
      <div className='text-center font-titan text-gray-600 uppercase'>{t("wallet.withdrawGuide")}</div>
      <div className='flex justify-center items-center mt-5 flex-col gap-2'></div>
    </div>
  );
};

export default InstructionTab;
