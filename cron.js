const cron = require("node-cron");
const { requestUserStats } = require("./bot");
const { setLastSended } = require("./utils");
const logger = require("./logger");

require("dotenv").config();

async function start()
{
    cron.schedule('0 0-59/10 * * * *', async () => {
        logger.info(`starting fetching request`);
        setLastSended(Date.now());
        await requestUserStats(true);
    });
    logger.info(`cron started`);
};

(async () => {
    start();
})();

module.exports = {
    start
};
