const sequelize = require("../../sequelize");

module.exports = {
    update: async function(user_id, status, prev_status) {
        await sequelize.models.requests.update(
            {
                status: status
            },
            {
                where: {
                    steam_user_id: user_id,
                    status: prev_status
                }
            });
    },
    get: async function(status, limit) {
        return await sequelize.models.requests.findAll({where: {status: status}, limit: limit});
    },
    insert: async function(steam_user_id, discord_user_id) {
        await sequelize.models.requests.create({
            steam_user_id: steam_user_id,
            discord_user_id: discord_user_id,
            status: "waiting",
        });
    },
    getDif: async function(user_id) {
        let user = await sequelize.models.requests.findOne({
            where: {
                discord_user_id: user_id,
                status: "waiting",
            },
            order: [ [ 'createdAt', 'DESC' ]],
        });
        let latest = await sequelize.models.requests.findOne({
            where: {
                status: "waiting"
            },
            order: [ [ 'createdAt', 'ASC' ]],
        });
        if(!user || !latest) return 1;
        let val = user.id - latest.id;
        return (val == 0 ? 1 : val);
    }
}