module.exports = {
    name: 'interactionCreate',
    execute: async function(bot, interaction) {
        if (interaction.isCommand()) {
            try {
                await bot.commands.get(interaction.commandName)(interaction, bot);
            } catch (error) {
                console.error(error);
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
            }
        }
    }
}