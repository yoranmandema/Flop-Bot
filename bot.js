
process.env = {
    DATABASE_URL: 'postgres://rdxnsbbbgvqnpa:a58f85d49f2166af2a785e68b68df8847c48c0adf3ad09e27620df8126da60de@ec2-54-217-236-201.eu-west-1.compute.amazonaws.com:5432/d78r5tm7lpdk2r',
    BOT_TOKEN: 'NTA0MDEyMjYwNzM0NDAyNTcx.Dq_KRw.XDhQeaalpdmQyDMVTxXXMo8oLKo'
}

app = {}
app.pg = {}
app.discord = {}

app.modules = {
    postgres: require('pg'),
    discord: require('discord.js'),
    training: require('./training/training'),
    debug: require('debug')
}

const postgresURL = process.env.DATABASE_URL
app.discussionChannel = null; 
app.robotChannel = null;

app.discord.client = new app.modules.discord.Client()

// Create new pool
app.pg.pool = new app.modules.postgres.Pool({
    connectionString: postgresURL
})

// Create new database client
app.pg.client = new app.modules.postgres.Client({
    connectionString: postgresURL
})
//app.pg.client.connect()

app.discord.client.login(process.env.BOT_TOKEN)

app.discord.client.on('ready', () => {
    console.log('Bot ready!')

    app.discussionChannel = app.discord.client.channels.find(x => x.id == '504032866829598731')
    app.robotChannel = app.discord.client.channels.find(x => x.id == "504335196418736148")

    app.modules.training.init(app)
});

app.discord.client.on('message', msg => {
    if(msg.author.id === app.discord.client.user.id) return;

    app.modules.training.trainOnMessage(msg.content)

    if (!(msg.channel == app.discussionChannel || msg.channel == app.robotChannel)) {
        return
    }

    let msgWords = msg.content.split(' ')
    let randomWord = msgWords[Math.floor(Math.random() * msgWords.length)]

    if (Math.random() > 0.25 && app.modules.training.words[randomWord] == undefined) {
        return
    }

    let message = generateMessage(100, randomWord)

    msg.channel.sendMessage(message)
});

var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    var key = keys[ keys.length * Math.random() << 0]

    return {key: key, value: obj[key]}
};

function generateMessage (length, start) {
    let words = app.modules.training.words

    let word;

    if (words[start] != undefined) {
        word = {key: start, value: words[start]}
    } else {
        word = randomProperty(words)
        let tries = 0
    
        while ((word.value == undefined || word.value.length == 0) && tries < 25) {
            word = randomProperty(words)
            tries++;
        }        
    }

    let message = word.key;

    for (let i = 0; i < length; i++) {
        if (word.value == undefined || word.value.length == 0) {
            break;
        }

        let nextWord = word.value[Math.floor(Math.random() * word.value.length)];

        word = {key: nextWord, value: words[nextWord]}

        if (word === undefined) {
            break;
        }

        message += " " + nextWord
    }

    return message
}