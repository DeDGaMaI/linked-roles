const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('users_tokens', {
		id: {
			primaryKey: true,
			autoIncrement: true,
			type: DataTypes.INTEGER,
			unique: true
		},
		discord_user_id: {
			type: DataTypes.BIGINT,
			unique: true,
		},
		access_token: {
			type: DataTypes.STRING,
			unique: true,
		},
		refresh_token: {
			type: DataTypes.STRING,
			unique: true,
		},
		expires_in: {
			type: DataTypes.DATE,
		},
	});
};