const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed } = require('discord.js');
const { connect, deleteDocument } = require('../database/actions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove_notification_ticker")
        .setDescription('Remove a notification value for a ticker')
        .addStringOption(option => option.setName('symbol').setDescription('Symbol ticker').setRequired(true))
    ,
    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        const symbol = interaction.options.get('symbol').value.toUpperCase();
        const userId = interaction.user.id;

        const embededMessage = new MessageEmbed();

        embededMessage
            .setTitle(`Remove notification ${symbol}`)
            ;

        try {
            // collection mongodb
            const collection = await connect();
            await deleteDocument(collection, { userId, symbol });

            embededMessage
                .setColor('#2aa198')
                .setDescription('```yaml\n' + 'Notification on symbol ' + symbol + ' removed' + '\n```')
                ;
            ;
        }
        catch (_) {
            embededMessage
                .setColor('#8B0000')
                .addField(
                    'Error bdd',
                    '```diff\nError on database, contact administrator please\n```'
                )
                ;

        }

        await interaction.reply({
            embeds: [embededMessage]
        });
    }
} 