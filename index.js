const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, guildId } = require('./config.json');
const notificationLimitOrder = require('./cron/notification.js');

const handleCommand = require('./helpers/command');
const handleSelectMenu = require('./helpers/select-menu');

// Intents (what bot can receive from events)
const myIntents = new Intents(32767);
// myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES);

// client discord
const client = new Client({ intents: myIntents });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', function () {
    console.log('--- STOCK EXCHANGE MARKET ---');    
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) handleCommand(client, interaction);
    if (interaction.isSelectMenu()) handleSelectMenu(interaction);
});

client.on('userUpdate', async (oldMember, newMember) => {
    console.log('2');
    console.log(oldMember, newMember);
});

client.on('typingStart', async (typingEvent) => {
    const {user, channel, startedTimestamp} = typingEvent;
    let lastTypingTimestamp;

    // every 15 min
    let betweenSchedule = lastTypingTimestamp ? new Date(lastTypingTimestamp + (1 * 60000)).getTime() : startedTimestamp;

    // channel général ID + flavio ID
    if (startedTimestamp >= betweenSchedule) {
    // if (channel.id === '767805471951421452' && user.id === '269781481285615616' && startedTimestamp > betweenSchedule) {
        lastTypingTimestamp = startedTimestamp;
        console.log('flavio écrit');
    }  
});

client.login(token);

// cron
(async () => {
    const job = await notificationLimitOrder(client);
    job.start();
})();



