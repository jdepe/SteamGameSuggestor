const fetchCheapShark = async (appid) => {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${appid}`);
    const data = await response.json();
    return data;
};
  
const fetchCheapSharkById = async (cheapSharkId) => {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${cheapSharkId}`);
    const data = await response.json();
    return data;
}

const fetchCheapSharkStores = async () => {
    const response = await fetch(`https://cheapshark.com/api/1.0/stores`);
    const data = await response.json();
    return data;
}

module.exports = { fetchCheapShark, fetchCheapSharkById, fetchCheapSharkStores };
  