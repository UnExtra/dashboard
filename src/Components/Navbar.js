import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../logo.png"; // Vérifiez que ce chemin est correct
import left from "../left.png"; // Vérifiez que ce chemin est correct
import "./styles.css"; // Assurez-vous que ce chemin est correct
import { useNavigate } from "react-router-dom";

const Navbar = ({ detail }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container d-flex justify-content-between">
        <a className="navbar-brand" href="/">
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "70px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo02"
          aria-controls="navbarTogglerDemo02"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
          {detail ? (
            <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <img
                src={left}
                style={{
                  width: "50px",
                  marginRight: 20,
                }}
              />
            </div>
          ) : (
            <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
              <li
                className={`nav-item ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/">
                  Liste utilisateurs
                </Link>
              </li>
              <li
                className={`nav-item ${
                  location.pathname === "/offers" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/offers">
                  Annonces
                </Link>
              </li>
              <li
                className={`nav-item ${
                  location.pathname === "/statistiques" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/statistiques">
                  Statistiques
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
