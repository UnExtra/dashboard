import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from '../logo.png'; // Verify this path is correct
import './styles.css'; // Ensure this path is correct

const Navbar = () => {
  const location = useLocation();

  return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container d-flex justify-content-between">
          <a className="navbar-brand" href="/">
            <img src={logo} alt="Logo" style={{width: '100px'}}/>
          </a>
          <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <li className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className={`nav-item ${location.pathname === "/leagues" ? "active" : ""}`}>
                <Link className="nav-link" to="/leagues">
                  Leagues
                </Link>
              </li>
              <li className={`nav-item ${location.pathname === "/clubs" ? "active" : ""}`}>
                <Link className="nav-link" to="/clubs">
                  Clubs
                </Link>
              </li>
              <li className={`nav-item ${location.pathname === "/admin" ? "active" : ""}`}>
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;
