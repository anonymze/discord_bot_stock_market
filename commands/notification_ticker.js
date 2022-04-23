const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed } = require('discord.js');
const fetchedData = require('../api/fetch.js');
const { connect, upsert } = require('../database/actions.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("notification_ticker")
        .setDescription('Set a notification value for a ticker, if trending below or above the limit you will be notified')
        .addStringOption(option => option.setName('symbol').setDescription('Symbol ticker').setRequired(true))
        .addNumberOption(option => option.setName('limit').setDescription('Limit\s notification').setRequired(true))
        .addStringOption(option =>
            option.setName('limit_order')
                .setDescription('Set when you want to trigger the notification')
                .addChoice('lower_than_limit', 'lower')
                .addChoice('higher_than_limit', 'higher')
                .setRequired(true)
        )
    ,
    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply();
        
        const symbol = interaction.options.get('symbol').value.toUpperCase();
        const limit = interaction.options.get('limit').value;
        const limit_order = interaction.options.get('limit_order').value;
        const userId = interaction.user.id;

        const embededMessage = new MessageEmbed();

        // Fetch data
        const { status, message } = await fetchedData(symbol);

        embededMessage
            .setTitle(`Notification ${symbol}`)
            .setFooter({ text: 'Yahoo finance' })
            ;

        if (status === 200) {
            try {
                // collection mongodb
                const collection = await connect();
                await upsert(collection, { userId, symbol }, { limit, limit_order, updatedAt: new Date() }, { createdAt: new Date() });

                embededMessage
                    .setColor('#2aa198')
                    .setDescription('```yaml\n' + 'You will be notified when the current value of ' + symbol + ' is ' + limit_order + ' than ' + limit + '\n```')
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
        } else {
            embededMessage
                .setColor('#8B0000')
                .addField(
                    'Error request',
                    '```diff\n' + message + '\n```'
                )
                ;
        }

        await interaction.editReply({
            embeds: [embededMessage]
        });
    }
} 