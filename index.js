const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token, guildId } = require('./config.json');
const notificationLimitOrder = require('./cron/notification.js');

const handleCommand = require('./helpers/command');
const handleSelectMenu = require('./helpers/select-menu');

const flavioId = '269781481285615616';
const generalChannelId = '767805471951421452';

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
    const { id, avatarOld } = oldMember;
    const { avatarNew } = newMember;

    if (id = flavioId && avatarOld !== avatarNew) {
        const channel = client.channels.cache.get(generalChannelId);
        const user = client.users.cache.get(flavioId);

        const texts = [
            'Oui oui, vous ne rêvez pas. Flavien a encore changé sa photo de profil.',
            'Les roses sont rouges, les violettes sont bleues, Flavien est un chien (désolé c\'était pour la rime).',
            'Beep boop, une nouvelle propagande du général Francisco Flavino.',
            'Non.',
        ]

        // Message
        const embededMessage = new MessageEmbed();
        embededMessage.setTitle(texts[Math.floor(Math.random() * texts.length)])
            .setColor('#2aa198')
            .setImage(user.displayAvatarURL());

        channel.send({ embeds: [embededMessage] });
    }
});

client.on('typingStart', async (typingEvent) => {
    const { user, channel, startedTimestamp } = typingEvent;
    let lastTypingTimestamp;

    // every 30 min
    let betweenSchedule = lastTypingTimestamp ? new Date(lastTypingTimestamp + (30 * 60000)).getTime() : startedTimestamp;

    // channel général ID + flavio ID
    if (channel.id === generalChannelId && user.id === flavioId && startedTimestamp >= betweenSchedule) {
        lastTypingTimestamp = startedTimestamp;
        const channel = client.channels.cache.get(generalChannelId);
        channel.send('⚠️ ⚠️ Flavien s\'apprête à lacher une masterclass ⚠️ ⚠️');
    }
});

client.login(token);

// cron
(async () => {
    const job = await notificationLimitOrder(client);
    job.start();
})();



