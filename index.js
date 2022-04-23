const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const notificationLimitOrder = require('./cron/notification.js');

const handleCommand = require('./helpers/command');
const handleSelectMenu = require('./helpers/select-menu');

// client discord
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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

client.login(token);

// cron
(async () => {
    const job = await notificationLimitOrder(client);
    job.start();
})();



