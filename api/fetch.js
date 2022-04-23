const { apiKey, apiUrl, apiMethod, apiHeaders } = require('../config.json');
const axios = require("axios");

const fetchedData = async (symbol, url = apiUrl) => {
    const constructedUrl = url;

    const options = {
        url: constructedUrl,
        method: apiMethod || 'GET',
        params: symbol ? { symbol }: {},
        headers: apiHeaders || {},
    };

    try {
        return axios.request(options)
            .then((infos) => {
                return {status: 200, ...infos.data.price}; 
            })
            .catch((err) => {
                const status = err.response.status;
                return { status, message: status === 404 ? 'API not found' : "Wrong ticker submitted" }; 
            })
    }
    catch (err) {
        return { status: 500, message: "Unknown error" };
    }
};

fetchedData('aapl')

module.exports = fetchedData;
