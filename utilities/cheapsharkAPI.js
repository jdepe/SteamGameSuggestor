const fetchCheapShark = async (appid) => {
    try {
        const response = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${appid}`);

        if (!response.ok) throw new Error('Failed to fetch cheap shark data. Please try again.');

        const data = await response.json();

        return data;

    } catch (error) {
        throw error;
    }

};
  
const fetchCheapSharkById = async (cheapSharkId) => {
    try {
        const response = await fetch(`https://www.cheapshark.com/api/1.0/games?ids=${cheapSharkId}`);

        if (!response.ok) throw new Error('Failed to fetch cheap shark ID data. Please try again.');

        const data = await response.json();

        return data;
    } catch (error) {
        throw error;
    }
}

const fetchCheapSharkStores = async () => {
    try { 
        const response = await fetch(`https://cheapshark.com/api/1.0/stores`);

        if (!response.ok) throw new Error('Failed to fetch cheap shark data. Please try again.');

        const data = await response.json();

        return data;
    } catch (error) {
        throw error;
    }
}

module.exports = { fetchCheapShark, fetchCheapSharkById, fetchCheapSharkStores };
  