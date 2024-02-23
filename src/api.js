import axios from "axios";

export const getPlayers = async () => {
  /*const { data } = await axios.get(
    "https://transfermarkt-api.vercel.app/clubs/244/players"
  );
  */
  const { data } = await axios.get(
      "http://dev39-kub:8080/players"
  );

  console.log('DATA', data)

  return data;
};

export const getImagePlayerIdExt = async (id) => {
  try {
    return "https://cdn-icons-png.flaticon.com/512/5281/5281503.png"
    const { data } = await axios.get(`https://transfermarkt-api.vercel.app/players/${id}/profile`);
    return data.imageURL;
  } catch (error) {
    return "https://cdn-icons-png.flaticon.com/512/5281/5281503.png"
  }
};

export const getPlayerById = async (id) => {
  const { data } = await axios.get(
      `http://dev39-kub:8080/players/${id}`
  );
  const imageUrl = await getImagePlayerIdExt(data.external_id);
  return {...data, imageUrl};
};

export const getClubById = async (id) => {
  const { data } = await axios.get(
      `http://dev39-kub:8080/clubs/${id}`
  );
  return data;
};

export const getPlayersByClubId = async (id) => {
  const { data } = await axios.get(
      `http://dev39-kub:8080/clubs/${id}/players`
  );

  console.log('DATA', data)

  return data;
};

export const getClubsByLeagueId = async (id) => {
  const { data } = await axios.get(
      `http://dev39-kub:8080/leagues/${id}/clubs`
  );

  console.log('DATA', data)

  return data;
};

export const deletePlayerById = async (id) => {
  console.log('ID TO DELETE', id);
  await axios.delete(
      `http://dev39-kub:8080/players/${id}`
  );
};

export const getAllLeagues = async () => {
  const { data } = await axios.get(
      "http://dev39-kub:8080/leagues"
  );

  return data;
};

export const getAllClubs = async () => {
  const { data } = await axios.get(
      "http://dev39-kub:8080/clubs"
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
