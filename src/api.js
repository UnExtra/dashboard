import axios from "axios";

export const getPlayers = async () => {
  /*const { data } = await axios.get(
    "https://transfermarkt-api.vercel.app/clubs/244/players"
  );
  */
  const { data } = await axios.get(
      "http://dev16-kub:8080/players"
  );

  console.log('DATA', data)

  return data;
};

export const deletePlayerById = async (id) => {
  console.log('ID TO DELETE', id);
  await axios.delete(
      `http://dev16-kub:8080/players/${id}`
  );
};

export const getAllLeagues = async () => {
  const { data } = await axios.get(
      "http://dev16-kub:8080/leagues"
  );

  return data;
};

export const getAllClubs = async () => {
  const { data } = await axios.get(
      "http://dev16-kub:8080/clubs"
  );

  return data;
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
