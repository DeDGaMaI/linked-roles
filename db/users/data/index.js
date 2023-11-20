const sequelize = require("../../../sequelize");

module.exports = {
    get: async function(user_id) {
        return await sequelize.models.users_data.findOne({
            where: {
                discord_user_id: user_id
            }
        });
    },
    getAll: async function() {
        return await sequelize.models.users_data.findAll();
    }
}