app = {};
app.pg = {};

const pg = require('pg')
app.discord = require('discord.js')
app.client = new app.discord.Client()

const connectionString = process.env.DATABASE_URL

app.pg.pool = new pg.Pool({
    connectionString: connectionString
})

app.pg.pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    app.pg.pool.end()
})

app.pg.client = new pg.Client({
    connectionString: connectionString
})
app.pg.client.connect()

app.pg.client.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    app.pg.client.end()
})

app.client.on('ready', () => {
    console.log('Bot ready!')
});

app.client.on('message', message => {
    message.reply('FUCK BOI')
});

app.client.login(process.env.BOT_TOKEN);