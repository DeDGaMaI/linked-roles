const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('requests', {
		id: {
			primaryKey: true,
			autoIncrement: true,
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
		},
		steam_user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		discord_user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM('waiting', 'ok', 'error'),
			allowNull: false,
		},
	});
};