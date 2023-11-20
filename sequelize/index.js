const { Sequelize } = require('sequelize');
const fs = require("fs");
const logger = require("../logger");
require("dotenv").config();

const sequelize = new Sequelize('linked-roles-1x6', process.env.DB_USER, process.env.DATABASE_PASSWORD, {
	host: 'localhost',
	dialect: 'mysql',
	logging: msg => logger.info({msg})
});

fs.readdir(__dirname + "/models", (err, files) => {
	files.forEach(file => {
		require(`./models/${file}`)(sequelize);
	});
});

module.exports = sequelize;
