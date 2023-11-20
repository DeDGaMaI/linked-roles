let bot = require("./bot");
let server = require("./server");
const sequelize = require("./sequelize");
require("dotenv").config();
const logger = require("./logger");

async function assertDatabaseConnectionOk() {
	console.log(`Checking database connection...`);
	try {
		await sequelize.authenticate();

		console.log('Database connection OK!');
	} catch (error) {
		console.log('Unable to connect to the database:');
		console.log(error.message);
		process.exit(1);
	}
}

async function init() {
	await assertDatabaseConnectionOk();
	bot.start(process.env.DISCORD_TOKEN);
	logger.info("started");
}

server.listen(5050, "127.0.0.1", () => {
	console.log("server listening port 5050");
});

init();
