const sequelize = require("../sequelize");
const users = require("./users");
const waitlist = require("./waitlist");

module.exports = {
    users: users,
    waitlist: waitlist,

    upsert: async function(Model, values, condition) {
        return await Model
            .findOne({where: condition})
            .then(async function (obj) {
                // update
                if (obj)
                    return await obj.update(values);
                // insert
                return await Model.create(values);
            })
    }
}