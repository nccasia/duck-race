import SoundLayout from "@/layouts/SoundLayout";
import GamePage from "@/pages/GamePage";
import HomePage from "@/pages/HomePage";
import RoomPage from "@/pages/RoomPage";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./path";
const RouteManager = () => {
  return (
    <Routes>
      <Route element={<SoundLayout />}>
        <Route path={ROUTES.GAME} element={<GamePage />} />
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ROOM} element={<RoomPage />} />
        <Route path={ROUTES.ROOM_DETAIL} element={<GamePage />} />
      </Route>
    </Routes>
  );
};
export default RouteManager;
