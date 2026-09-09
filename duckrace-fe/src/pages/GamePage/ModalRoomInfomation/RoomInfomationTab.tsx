import useRoomStore from "@/stores/roomStore";
import { useTranslation } from "react-i18next";

const RoomInformationTab = () => {
  const { t } = useTranslation();
  const { currentRoom, roomMembers } = useRoomStore();
  return (
    <div className='text-gray-700 font-titan text-[18px] flex flex-col gap-3'>
      <div className='flex justify-between items-center'>
        <span>{t("room.roomCode")}</span>
        <span>{currentRoom?.roomInfo?.roomId}</span>
      </div>
      <div className='flex justify-between items-center'>
        <span>{t("room.roomName")}</span>
        <span>{currentRoom?.roomInfo?.roomName}</span>
      </div>
      <div className='flex justify-between items-center'>
        <span>{t("room.password")}</span>
        <span>{t("common.noPassword")}</span>
      </div>
      <div className='flex justify-between items-center'>
        <span>{t("room.owner")}</span>
        <span>{currentRoom?.owner?.userName}</span>
      </div>
      <div className='flex justify-between items-center'>
        <span>{t("room.roomBet")}</span>
        <span>
          {currentRoom?.roomInfo?.roomBet} {t("common.vnd")}
        </span>
      </div>
      <div className='flex justify-between items-center'>
        <span>{t("room.expiredTime")}</span>
        <span>
          {currentRoom?.expiredTime} {t("common.second")}
        </span>
      </div>
      <div className='flex justify-between items-center'>
        <span>{t("room.memberCount")}</span>
        <span>{roomMembers?.length}</span>
      </div>
    </div>
  );
};
export default RoomInformationTab;
