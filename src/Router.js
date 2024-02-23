// Router.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Routes,
} from "react-router-dom";
import Home from "./Components/Home";
import Admin from "./Components/Admin";
import Leagues from "./Components/Leagues";
import Clubs from "./Components/Clubs";
import ClubDetail from "./Components/ClubDetail";
import LeagueDetail from "./Components/LeagueDetail";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/club/:id" element={<ClubDetail />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/league/:id" element={<LeagueDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
