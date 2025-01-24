import GamePage from "@/pages/GamePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./path";
import HomePage from "@/pages/HomePage";
import RoomPage from "@/pages/RoomPage";

const RouteManager = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path={ROUTES.GAME} element={<GamePage />} />
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.ROOM} element={<RoomPage />} />
          <Route path={ROUTES.ROOM_DETAIL} element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default RouteManager;
