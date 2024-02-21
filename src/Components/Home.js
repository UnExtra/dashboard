import React, { useState, useEffect } from "react";
import "./styles.css";
import { getPlayers } from "../api";
import Navbar from "./Navbar";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const playersList = await getPlayers();
      setPlayers(playersList);
    } catch (error) {
      console.error("Error fetching players data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlayers = (player) => {
    const normalizeString = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const searchNormalized = normalizeString(searchTerm);
    return (
      normalizeString(player.name).includes(searchNormalized) ||
      normalizeString(player.position).includes(searchNormalized) ||
      (player.marketValue &&
        normalizeString(player.marketValue.toString()).includes(
          searchNormalized
        ))
    );
  };

  const filteredPlayers = players.filter(filterPlayers);

  return (
    <div className="container mt-5">
      <Navbar />
      <div className="row mb-3 justify-content-center">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search for a player, club, or league..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border text-primary mt-5" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="row">
          <div className="col">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Market Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>{player.id}</td>
                    <td>{player.name}</td>
                    <td>{player.position}</td>
                    <td>{player.marketValue ? player.marketValue : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center">No players found 😢</p> // Message displayed outside the table
      )}
    </div>
  );
};

export default Home;
