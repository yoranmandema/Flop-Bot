
const postgresURL = process.env.DATABASE_URL

app = {}
app.pg = {}
app.discord = {}

app.modules = {
    postgres: require('pg'),
    discord: require('discord.js')
}

app.discord.client = new app.modules.discord.Client()

// Create new pool
app.pg.pool = new app.modules.postgres.Pool({
    connectionString: postgresURL
})

// Create new database client
app.pg.client = new app.modules.postgres.Client({
    connectionString: postgresURL
})
app.pg.client.connect()

app.discord.client.on('ready', () => {
    console.log('Bot ready!')
});

app.discord.client.on('message', msg => {

    if (msg.channel.id != '504032866829598731') {
        return
    }

    if (msg.content.startsWith('.flop')) {
        let message = msg.content.split('.flop')[0] || ''

        message.reply(message)
    }
});

app.discord.client.login(process.env.BOT_TOKEN)