const {SlashCommandBuilder} = require('@discordjs/builders');
//const {getLastSended} = 
const db = require("../../db");
const { model } = require("../../utils");
const { requestUserStats, pushUserMetadata, handleDbErrors} = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with a pong!'),
    execute: async function (interaction, bot) {
        if(interaction.user.id !== "506449663042256899") {
            await interaction.reply({content: `you cant use this command`, ephemeral: true})
            return;
        }
        //тестовая комманда
        
        //await handleDbErrors();
        //await pushUserMetadata("570956913181720587")
        //await db.upsert(model("data"), {steam_user_id: 1231231234, discord_user_id: 1231231234, rating: 1000, avg_place: 1.1, match_count: 234, first_places: 213}, {steam_user_id: 1231231234});
        //await requestUserStats();
        //let timestamp = require("../../utils").getLastSended() + (1000 * 60 * 10 * Math.ceil(await db.waitlist.getDif("506449663042256899")/10))
        //console.log(timestamp, Math.ceil(await db.waitlist.getDif("506449663042256899")/10), require("../../utils").getLastSended())
        //await interaction.reply({content: `<t:${Math.ceil(timestamp/1000)}:R>`, ephemeral: true});
        await interaction.reply({content: `ok`, ephemeral: true});
    },
}
