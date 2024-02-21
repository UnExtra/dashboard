// ClubTable.jsx
import React from "react";

const LeagueTable = ({ searchResults, addItem, sectionName }) => {
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
            <th>Country</th>
            <th>Clubs</th>
            <th>Players</th>
            <th>Add</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((club, index) => (
            <tr key={club.id}>
              <td>{index + 1}</td>
              <td>{club.name}</td>
              <td>{club.country}</td>
              <td>{club.clubs}</td>
              <td>{club.players}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addItem("club", club)}
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

export default LeagueTable;
