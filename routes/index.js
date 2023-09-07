var express = require('express');
var router = express.Router();
const {incrementCounter} = require('../counter');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const counter = await incrementCounter();
    res.render('index', { title: 'Game Suggestions',  counter: counter});
  } catch (err) {
    console.error(error);
    res.status(500).send('Internal Error');
  }
});

router.get('/search', (req, res) => {
  const query = req.query.query;
  res.redirect(`/suggested-games?query=${query}`);
});

// Steam
router.get("/suggested-games", async function (req, res) {
  const STEAM_KEY = process.env.STEAM_API_KEY;
  const steam_id = req.query.query;
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


  // Find Game IDS on CheapShark
  async function fetchCheapShark(appid) {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${appid}`);
    const data = await response.json();
    return data;
  }

  let cheapSharkData = [];

  for (const game of gamesNotOwned) {
    const result = await fetchCheapShark(game.appid);
    cheapSharkData.push(result);
  }

  cheapSharkData = cheapSharkData.flat();

  async function fetchCSAgain(csid) {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${csid}`);
    const data = await response.json();
    return data;
  }

  let csagain = [];

  for (const game of cheapSharkData) {
    csagain.push(game.gameID);
  }

  csagain = csagain.join(',');
  csagain = await fetchCSAgain(csagain);

  const cheapSharkStores = await fetch(`https://cheapshark.com/api/1.0/stores`)
  const finalCheapSharkStores = await cheapSharkStores.json();

  const storeLookup = {};
  finalCheapSharkStores.forEach((store) => {
    storeLookup[store.storeID] = {
      name: store.storeName,
      logo: store.images.banner
    };
  });

  const finalList = [];

  for (const gameId in csagain) {
    if (csagain.hasOwnProperty(gameId)) {
      const currentGame = csagain[gameId];

      const newObj = {
        title: currentGame.info.title,
        thumb: currentGame.info.thumb,
        retailPrice: currentGame.deals.length > 0 ? currentGame.deals[0].retailPrice : 'N/A',
        deals: currentGame.deals.map((deal) => {
          return {
            currentPrice: deal.price,
            storeName: storeLookup[deal.storeID].name,
            storeLogo: storeLookup[deal.storeID].logo,
          };
        })
      };

      finalList.push(newObj);
    }
  }


  res.render('steam-search', {title: "Suggested Games", query: steam_id, results: finalList });
});

router.get("/:gameTitle", async function (req, res) {
  const GIANT_BOMB_KEY = process.env.GIANTBOMB_API_KEY;
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  const gameTitle = req.params.gameTitle;
  const gameDetails = await fetch(`http://www.giantbomb.com/api/search/?api_key=${GIANT_BOMB_KEY}&limit=1&format=json&query="${gameTitle}"&resources=game`)
  const details = await gameDetails.json();
  
  let filteredDetails = details.results[0];
  filteredDetails = {
    name: filteredDetails.name,
    deck: filteredDetails.deck,
    description: filteredDetails.description,
    original_release_date: filteredDetails.original_release_date,
    platforms: filteredDetails.platforms.map(platform => platform.name),
    image: filteredDetails.image.original_url
  }

  const youtubeSearch = gameTitle + " review";
  const youtubeResponse = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&order=relevance&q=${youtubeSearch}&key=${YOUTUBE_API_KEY}`);
  const youtubeData = await youtubeResponse.json();

  const youtubeUrls = youtubeData.items.map(item => item.id.videoId);

  res.render('game', {title: details.name, results: filteredDetails, youtube: youtubeUrls})
});

module.exports = router;
