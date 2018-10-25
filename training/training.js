let allMessages
let discord
let postgres
let debug 
let textChannels
let words = {}

let wordObject = function (w){
    this.word = w
    this.linked = []
}

exports.init = function (app) {
    discord = app.discord
    postgres = app.modules.postgres
    debug = app.modules.debug

    allMessages = new app.modules.discord.Collection()

    textChannels = discord.client.channels.filter(x => x.type == "text")
 
    getMessages()
}

exports.words = words;

let currentChannel = 0

function getMessages () {
    app.discussionChannel.send(`Getting ${app.process.env.MAX_MESSAGES} messages from ${textChannels.size} channels`);

    textChannels = textChannels.filter(x => x != app.discussionChannel)
    textChannels = textChannels.filter(x => x != app.robotChannel)

    textChannels.tap(channel => {
        getAllMessagesInChannel (channel.lastMessageID, channel)
    })        
}

function getAllMessagesInChannel (before, channel) {
    channel.fetchMessages({ before: before, limit: 100 })
        .then(messages => {
            allMessages = allMessages.concat(messages)

            let last = messages.last()

            var dateString = last.createdAt.toLocaleDateString("nl-NL", {year: 'numeric', month: 'numeric', day: 'numeric'})

            console.log(`Got messages from ${channel.name}, oldest: ${dateString}, total: ${allMessages.size}`)

            if (allMessages.size < app.process.env.MAX_MESSAGES) {
                getAllMessagesInChannel(last.id, channel)
            } else {
                currentChannel++

                console.log(`Finished with channel: ${channel.name}, processed ${currentChannel}`)

                if (currentChannel == textChannels.size) {
                    console.log(`recieved all messages! Total ${allMessages.size}`)

                    app.discussionChannel.send(`recieved all messages! Total ${allMessages.size}`);
                    onHasAllMessages()
                }
            }
        }).catch(_ => {
            currentChannel++
            console.log(`Finished with channel: ${channel.name}, processed ${currentChannel}`)
        })
}

function onHasAllMessages () {
    console.log(`recieved all messages! Total ${allMessages.size}`)

    let content = ''

    allMessages.tap(message => {
        content += message.content + " "
    })

    trainOnMessage(content.toLowerCase())

    console.log(words.length)

    console.log(`Bot trained!`)
}

function trainOnMessage (message) {
    message = message.replace(/<@(\d+)>/g, (full, id) => {
        let member = msg.guild.members.get(id)

        if (member.nickname != undefined) {
            return member.nickname
        } else {
            return member.user.username
        }
    })

    let wordsInMessage = message.split(' ')

    for (let i = 0; i < wordsInMessage.length - 1; i++) {
        let currentWord = wordsInMessage[i]
        let nextWord = wordsInMessage[i + 1]

        if (words[currentWord] === undefined) {
            words[currentWord] = []
        } else {
            words[currentWord].push(nextWord)
        }
    }
}

exports.trainOnMessage = trainOnMessage
