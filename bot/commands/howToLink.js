const {SlashCommandBuilder} = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('howtolink')
        .setDescription('Отправляет специальное сообщение')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    execute: async function (interaction, bot) {
        if(interaction.user.id !== "506449663042256899" && interaction.user.id !== "237197189552668672" && interaction.user.id !== "364494531963518976") {
            await interaction.reply({content: `you cant use this command`, ephemeral: true});
            return;
        }
        try {
            interaction.channel.createWebhook({
                name: 'Dota1x6MMR',
                avatar: 'https://cdn.discordapp.com/avatars/1159865752841629706/8a3ff2d0e332c7ca97288da482478340.webp?size=160',
            }).then(async wh => {
                const embed = new EmbedBuilder()
                    .setColor(0xe2d92a)
                    .setTitle("ПОДТВЕРЖДЁННЫЙ АККАУНТ")
                    .setImage("https://cdn.discordapp.com/attachments/1055836404812353646/1167526414988365864/how-to-link-role.gif")
                    .setDescription("\`\`\`Если вы хотите получить роль со статистикой - \nпривяжите ваш Steam к Discord аккаунту и следуйте интрукциям ниже.\`\`\`");
                wh.send({
                    embeds: [embed]
                });
                wh.delete();
            })
            await interaction.reply({content: `Успех`, ephemeral: true});
        } catch(e)
        {
            await interaction.reply({content: "Произошла ошибка(у бота нет прав тут писать мб или чо)", ephemeral: true})
        }
    },
}
