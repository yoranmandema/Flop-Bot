app = {}
app.discord = {}
app.process = process

app.modules = {
    discord: require('discord.js'),
    training: require('./training/training'),
    debug: require('debug')
}

app.discussionChannel = null;
app.flopChannel = null;

app.discord.client = new app.modules.discord.Client()

app.discord.client.login(process.env.BOT_TOKEN)

app.discord.client.on('ready', () => {
    console.log('Bot ready!')

    app.discussionChannel = app.discord.client.channels.find(x => x.id == '504032866829598731')
    app.flopChannel = app.discord.client.channels.find(x => x.id == "504609258692804608")

    app.modules.training.init(app)
});

let users = {};

app.discord.client.on('message', msg => {
    if(msg.author.id === app.discord.client.user.id) return;
    
    if(msg.author.id != '338699578834550784') {
        app.modules.training.trainOnMessage(msg.content)
    }

    if (!(msg.channel == app.discussionChannel || msg.channel == app.flopChannel)) {
        return
    }

    let msgWords = msg.content.toLowerCase().split(' ')
    let randomWord = msgWords[Math.floor(Math.random() * msgWords.length)]

    if (Math.random() > 0.25 && app.modules.training.words[randomWord] == undefined) {
        return
    }

    let message = generateMessage(100, randomWord)
    
    message = message.replace(/<@(\d+)>/g, (full, id) => {
        let member = msg.guild.members.get(id)

        if (member.nickname != undefined) {
            return member.nickname
        } else {
            return member.user.username
        }
    })

    msg.channel.send(message)
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

    if (message == undefined) {
        message = ""
    }

    return message.substring(0, 2000);
}
