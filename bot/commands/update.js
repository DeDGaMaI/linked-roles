const {SlashCommandBuilder} = require('@discordjs/builders');
const {updateStats} = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Start updating users stats!'),
    execute: async function (interaction, bot) {
        if(interaction.user.id !== "506449663042256899") {
            await interaction.reply({content: `you cant use this command`, ephemeral: true})
            return;
        }
        await updateStats();
        await interaction.reply({content: `updating roles`, ephemeral: true});
    },
}
