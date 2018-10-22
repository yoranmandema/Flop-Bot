app = {};

app.discord     = require('discord.js');
app.client      = new app.discord.Client();

app.client.on('ready', () => {
    console.log('Bot ready!');
});

app.client.on('message', message => {
    message.reply('FUCK BOI');
});

console.log(JSON.stringify(process.env));

app.client.login(process.env.BOT_TOKEN);