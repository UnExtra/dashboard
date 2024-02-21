// PlayerTable.jsx
import React from "react";

const PlayerTable = ({ searchResults, addItem, sectionName }) => {
  if (searchResults.length == 0) {
    return null;
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th>Club</th>
            <th>Age</th>
            <th>Nationality</th>
            <th>Market Value</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td>{player.position}</td>
              <td>{player.club.name}</td>
              <td>{player.age}</td>
              <td>{player.nationalities.join(", ")}</td>
              <td>{player.marketValue}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addItem(sectionName.toLowerCase(), player)}
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
