const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('users_data', {
		id: {
			primaryKey: true,
			autoIncrement: true,
			type: DataTypes.INTEGER,
			unique: false,
			allowNull: false,
		},
		steam_user_id: {
			type: DataTypes.STRING,
			unique: true,
		},
		discord_user_id: {
			type: DataTypes.STRING,
			unique: false,
		},
		rating: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		avg_place: {
			type: DataTypes.DOUBLE,
			allowNull: false,
		},
		match_count: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		first_places: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	});
};