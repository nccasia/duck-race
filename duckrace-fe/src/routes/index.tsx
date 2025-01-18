import GamePage from "@/pages/GamePage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./path";
import HomePage from "@/pages/HomePage";

const RouteManager = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route path={ROUTES.GAME} element={<GamePage />} />
          <Route path={ROUTES.HOME} element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default RouteManager;
