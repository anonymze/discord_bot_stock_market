var CronJob = require('cron').CronJob;
const { connect, findDocumentsUpdatedAfterOneDay } = require('../database/actions');
const fetchedData = require('../api/fetch.js');
const { channelNotifName, guildId } = require('../config.json');
const { Client, MessageEmbed } = require('discord.js');

/**
 * 
 * @param {Client} collection 
 */
module.exports =
    async function notificationLimitOrder(client) {
        // collection mongodb
        const collection = await connect();

        // request every 8 hours
        return new CronJob('* * */8 * * *', async function () {
            const results = await findDocumentsUpdatedAfterOneDay(collection);

            for (let {userId, symbol, limit, limit_order} of results) {
                const { status, regularMarketPrice, currencySymbol } = await fetchedData(symbol);

                if (status === 200) {
                    const embededMessage = new MessageEmbed()
                        .setColor('#b58900')
                        .setTitle('Limit order triggered !')
                        .setDescription('```fix\n' + 'Your limit order (' + limit + ') of ' + symbol + ' is ' + limit_order + ' than ' + regularMarketPrice.fmt + '\n```')
                        .addField('\u200b', "<@" + userId + ">", true)
                        .addField('\u200b', symbol, true)
                        .addField('\u200b', currencySymbol, true)
                        .setFooter({ text: 'Yahoo finance' })
                        ;

                    // const channelNotif = client.guilds.cache.get(guildId).channels.cache.get(channelNotifId);
                    const channelNotif = client.guilds.cache.get(guildId).channels.cache.find(channel => channel.name === channelNotifName);

                    if (limit_order === 'higher' && parseInt(limit) > parseInt(regularMarketPrice.fmt)) {                        
                        console.log(`Notif send for ${limit_order} limit ${symbol} - ${new Date()}`);

                        channelNotif.send({
                            embeds: [embededMessage]
                        });
                    } else if (limit_order === 'lower' && parseInt(limit) < parseInt(regularMarketPrice.fmt)) {
                        console.log(`Notif send for ${limit_order} limit ${symbol} - ${new Date()}`);

                        channelNotif.send({
                            embeds: [embededMessage]
                        });
                    }
                }
            }
        }, null, true, 'Europe/Zurich');
    }

