
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

app.discord.client.on('message', message => {
    message.reply('FUCK BOI')
});

app.discord.client.login(process.env.BOT_TOKEN)