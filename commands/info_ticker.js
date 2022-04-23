const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed } = require('discord.js');
const fetchedData = require('../api/fetch.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticker")
        .setDescription('Get info single ticker')
        .addStringOption(option => option.setName('symbol').setDescription('Symbol ticker'))
    ,
    /**
     *
     * @param {CommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply();
        
        const symbolOption = interaction.options.get('symbol');

        const embededMessage = new MessageEmbed();

        // if pas d'option return template result
        if (!symbolOption) {
            embededMessage
                .setTitle('Generic symbol')
                .setFooter({ text: 'Generic API' })
                .setColor('#888888')
                .setDescription('```Generic --- Exchange platform```')
                .addFields(
                    // { name: '\u200B', value: '\u200B' },
                    { name: 'Current market', value: 'Generic', inline: true },
                    { name: 'Volume', value: 'Generic', inline: true },
                )
                ;

            await interaction.editReply({
                embeds: [embededMessage]
            });

            return;
        }

        // Fetch data
        const symbolValue = symbolOption.value.toUpperCase();
        const { status, message, regularMarketPrice, regularMarketVolume, currencySymbol, exchangeName } = await fetchedData(symbolValue);

        embededMessage
            .setTitle(symbolValue)
            .setFooter({ text: 'Yahoo finance' });

        if (status === 200) {
            embededMessage
                .setColor('#666666')
                .setDescription('```' + exchangeName + ' --- Exchange platform```')
                .addFields(
                    { name: 'Current market', value: regularMarketPrice.fmt + currencySymbol, inline: true },
                    { name: 'Volume', value: regularMarketVolume.fmt, inline: true },
                )
                ;
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