const fetch = require('node-fetch');

const STEAM_API_URL = "http://api.steampowered.com/";
const STEAM_API_KEY = process.env.STEAM_API_KEY;

const fetchOwnedGames = async (steam_id) => {
    try {
        const response = await fetch(`${STEAM_API_URL}IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steam_id}&include_appinfo=true`);

        if (!response.ok) throw new Error('Failed to fetch the owned games list');

        const data = await response.json();

        return data.response.games.map(game => ({ name: game.name, appid: game.appid }));
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const fetchFriendList = async (steam_id) => {
    try {
        const response = await fetch(`${STEAM_API_URL}ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steam_id}&relationship=friend`);

        if (!response.ok) throw new Error('Failed to fetch the friend list');

        const data = await response.json();

        return data.friendslist.friends.slice(0,5); // take first 5 friends to compare
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const fetchRecentlyPlayedGames = async (steam_id) => {
    try {
        const response = await fetch(`${STEAM_API_URL}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_KEY}&steamid=${steam_id}&format=json`);
        
        if (!response.ok) throw new Error('Failed to fetch recently played games');

        const data = await response.json();

        return data.response.games || [];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    fetchOwnedGames,
    fetchFriendList,
    fetchRecentlyPlayedGames,
};