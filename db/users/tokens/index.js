const sequelize = require("../../../sequelize");

module.exports = {
    get: async function(discord_user_id) {
        return await sequelize.models.users_tokens
            .findOne({ 
                where: {
                    discord_user_id: discord_user_id
                } 
            });
    }
}