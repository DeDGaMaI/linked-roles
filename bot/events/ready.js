const {Collection} = require("discord.js");
const logger = require("../../logger");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: 'ready',
    execute: async function (bot) {
        logger.info("bot started");

        bot.commands = new Collection();
        const commands = [];
        const commandFiles = fs.readdirSync(path.join(process.cwd(), 'bot', 'commands')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            commands.push(command);
        }
        console.log(commands)
        commands.forEach(command => {
            bot.commands.set(command.data.name, command.execute);
            bot.application?.commands.create(command.data);
        });
        
        bot.application.editRoleConnectionMetadataRecords([
            {
                key: "verified",
                name: "✅",
                type: 7,
                description: "Подтверждённый аккаунт"
            },
            {
                key: "rating",
                name: "- mmr 🏅",
                type: 3,
                description: "Количество ММР"
            },
            {
                key: "match_count",
                name: "- игр ⏳",
                type: 3,
                description: "Количество игр"
            },
            {
                key: "avg_place",
                name: "- среднее место 🎯",
                type: 3,
                description: "Среднее место"
            },
            {
                key: "first_places",
                name: "- первых мест 🏆",
                type: 3,
                description: "Количество побед"
            },
        ]);
        logger.info("registered metadata record");
    }
}