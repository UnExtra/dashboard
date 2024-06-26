// Router.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Routes,
} from "react-router-dom";
import Home from "./Components/Home";
import User from "./Components/User";
import Statistiques from "./Components/Statistiques";
import Offers from "./Components/Offers";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<User />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/statistiques" element={<Statistiques />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
