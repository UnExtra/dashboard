import axios from 'axios';

export const getPlayers = async () => {
    const { data } = await axios.get('https://transfermarkt-api.vercel.app/clubs/244/players');
    return data.players;
};

