var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Docker Mashup' });
});

// Steam
router.get("/suggested-games", async function (req, res) {
  const STEAM_KEY = process.env.STEAM_API_KEY;
  const steam_id = "76561198032549999";
  const steam_url = "http://api.steampowered.com/"

  // FIRST CALL TO GET OWNED GAMES LIST
  const firstRes = await fetch(`${steam_url}IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${steam_id}&include_appinfo=true`)
  const ownedGameData = await firstRes.json();
  let gamesList = ownedGameData.response.games;
  gamesList = gamesList.map(game => ({
    name: game.name,
    appid: game.appid,
  }))

  // // SECOND CALL TO GET FRIENDS LIST
  const secondRes = await fetch(`${steam_url}ISteamUser/GetFriendList/v0001/?key=${STEAM_KEY}&steamid=${steam_id}&relationship=friend`);
  const friendData = await secondRes.json();
  const firstFiveFriends = friendData.friendslist.friends.slice(0,5);
  
  // THIRD CALL TO GET EACH FRIENDS RECENTLY PLAYED GAMES
  async function fetchRecentlyPlayedGames(steamid) {
    const response = await fetch(`${steam_url}IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_KEY}&steamid=${steamid}&format=json`);
    const data = await response.json();
    return data;
  }

  let recentGames = [];

  for (const friend of firstFiveFriends) {
    const result = await fetchRecentlyPlayedGames(friend.steamid);
    recentGames.push(result);
  }

  const flattenedGames = recentGames.map(item => item.response.games || []).flat();

  const uniqueGamesMap = {};
  const uniqueGames = [];

  flattenedGames.forEach(game => {
    if (!uniqueGamesMap[game.appid]) {
      uniqueGamesMap[game.appid] = true;
      uniqueGames.push(game)
    }    
  });

  // Compare friends recent games to your owned games
  const gamesNotOwned = uniqueGames.filter(friendGame => 
    !gamesList.some(myGame => myGame.appid === friendGame.appid));

  console.log(gamesNotOwned);

  // Find Game IDS on CheapShark
  const cs = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${gamesNotOwned[0].appid}`);
  const csRes = await cs.json();
  console.log(csRes);


  res.render('steam-search', {query: 'me', results: gamesNotOwned, deal: gamesDeals});
});

module.exports = router;
