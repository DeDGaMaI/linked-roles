const axios = require("axios");
const logger = require("../logger");

require("dotenv").config();

module.exports = {
    getUsersStats: async function(steam_ids) {
        try
        {
            let res = await axios.post(proccess.env.ENDPOINT_URL, JSON.stringify(steam_ids), {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            logger.info(`sending request to dota1x6: ${JSON.stringify(steam_ids)}`);
            return res;
        } catch(e)
        {
            logger.info({err: e});
        }
    }
}