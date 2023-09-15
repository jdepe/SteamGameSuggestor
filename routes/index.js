var express = require('express');
var router = express.Router();
const {incrementCounter} = require('../utilities/counter');
const { fetchOwnedGames, fetchFriendList, fetchRecentlyPlayedGames } = require('../utilities/steamAPI');
const { fetchCheapShark, fetchCheapSharkById, fetchCheapSharkStores } = require('../utilities/cheapsharkAPI');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const counter = await incrementCounter();
    res.render('index', { title: 'Game Suggestions',  counter: counter});
  } catch (error) {
    console.error(error);
    res.render('error', {error});
  }
});

// Steam
router.get(`/suggested-games`, async function (req, res) {
  
  try {
    const steam_id = req.query.steamid;

    // Fetch owned games
    let gamesList = await fetchOwnedGames(steam_id);

    // Fetch friend list
    const firstFiveFriends = await fetchFriendList(steam_id);

    // Fetch recently played games of friends
    let recentGames = []; 

    for (const friend of firstFiveFriends) {
      const result = await fetchRecentlyPlayedGames(friend.steamid);
      recentGames.push(result);
    }
    
    const flattenedGames = recentGames.flat();

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
  
    let cheapSharkData = [];
  
    for (const game of gamesNotOwned) {
      const result = await fetchCheapShark(game.appid);
      cheapSharkData.push(result); 
    }
  
    cheapSharkData = cheapSharkData.flat();
  
    let cheapSharkById = [];
  
    for (const game of cheapSharkData) {
      cheapSharkById.push(game.gameID);
    }
  
    cheapSharkById = cheapSharkById.join(',');
    cheapSharkById = await fetchCheapSharkById(cheapSharkById);
  
    const cheapSharkStores = await fetchCheapSharkStores();
  
    const storeLookup = {};
    cheapSharkStores.forEach((store) => {
      storeLookup[store.storeID] = {
        name: store.storeName,
        logo: store.images.banner
      };
    });
  
    const finalList = [];
  
    for (const gameId in cheapSharkById) {
      if (cheapSharkById.hasOwnProperty(gameId)) {
        const currentGame = cheapSharkById[gameId];
        const newObj = {
          title: currentGame.info.title,
          thumb: `https://cdn.cloudflare.steamstatic.com/steam/apps/${currentGame.info.steamAppID}/header.jpg`,
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

  } catch (error) {
    console.error(error);
    res.render('error', {error});
  }
});

router.get("/:gameTitle", async function (req, res) {
  try {
    const GIANT_BOMB_API_KEY = process.env.GIANT_BOMB_API_KEY;
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    const gameTitle = req.params.gameTitle;
    
    const gameDetails = await fetch(`http://www.giantbomb.com/api/search/?api_key=${GIANT_BOMB_API_KEY}&limit=1&format=json&query="${gameTitle}"&resources=game`);
    const details = await gameDetails.json();
    
    if(!details.results || !details.results.length) {
      throw new Error("No game details found");
    }

    let filteredDetails = details.results[0];
    filteredDetails = {
      name: filteredDetails.name || "No name available",
      description: filteredDetails.description || "No description available",
      original_release_date: filteredDetails.original_release_date || "No release date available",
      platforms: filteredDetails.platforms ? filteredDetails.platforms.map(platform => platform.name) : ["No platforms available"],
      image: filteredDetails.image.original_url,
    }
    
    const youtubeSearch = gameTitle + " review";
    const youtubeResponse = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&order=relevance&q=${youtubeSearch}&key=${YOUTUBE_API_KEY}`);
    const youtubeData = await youtubeResponse.json();

    let youtubeUrls = [];

    if (youtubeData.error) {
      console.error('YouTube API error:', youtubeData.error.message);
    } else if (youtubeData.items) {
      youtubeUrls = youtubeData.items.map(item => item.id.videoId);
    }

    res.render('game', { title: details.name, results: filteredDetails, youtube: youtubeUrls });

  } catch (error) {
    console.error(error);
    res.render('error', {error});
  }
});


module.exports = router;
