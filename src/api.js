import axios from "axios";

export const getPlayers = async () => {
  const { data } = await axios.get(
    "https://transfermarkt-api.vercel.app/clubs/244/players"
  );
  return data.players;
};

export const searchPlayers = async (searchTerm) => {
  console.log("searchTerm", searchTerm);
  try {
    const response = await axios.get(
      `https://transfermarkt-api.vercel.app/players/search/${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching players:", error);
    throw error;
  }
};

export const searchLeagues = async (searchTerm) => {
  try {
    const response = await axios.get(
      `https://transfermarkt-api.vercel.app/competitions/search/${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching leagues:", error);
    throw error;
  }
};

export const searchClubs = async (searchTerm) => {
  console.log("searchTerm", searchTerm);
  try {
    const response = await axios.get(
      `https://transfermarkt-api.vercel.app/clubs/search/${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching clubs:", error);
    throw error;
  }
};
