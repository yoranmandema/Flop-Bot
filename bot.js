app = {}
app.pg = {}
app.discord = {}

app.modules = {
    postgres: require('pg'),
    discord: require('discord.js')
}

app.discord.client = new app.modules.discord.Client()

const connectionString = process.env.DATABASE_URL

// Create new pool
app.pg.pool = new app.modules.postgres.Pool({
    connectionString: connectionString
})

// Create new database client
app.pg.client = new app.modules.postgres.Client({
    connectionString: connectionString
})
app.pg.client.connect()

app.discord.client.on('ready', () => {
    console.log('Bot ready!')
});

app.discord.client.on('message', message => {
    message.reply('FUCK BOI')
});

app.discord.client.login(process.env.BOT_TOKEN);