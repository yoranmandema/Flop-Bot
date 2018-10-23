
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
    app.discussionChannel.sendMessage(`Getting messages from ${textChannels.size} channels`);

    textChannels = textChannels.filter(x => x != app.discussionChannel)
    textChannels = textChannels.filter(x => x != app.robotChannel)

    textChannels.tap(channel => {
        getAllMessagesInChannel (channel.lastMessageID, channel)
    })        
}

function getAllMessagesInChannel (before, channel) {
    console.log(`Getting rest messages from ${channel.name}, before ${before}`)

    channel.fetchMessages({ before: before, limit: 100 })
        .then(messages => {
            //console.log(`Received ${messages.size} messages from ${channel.name}`)
            allMessages = allMessages.concat(messages)

            if (messages.size == 100 && allMessages.size < app.process.MAX_MESSAGES) {
                getAllMessagesInChannel(messages.first().id, channel)
            } else {
                currentChannel++

                //app.discussionChannel.sendMessage(`Finished with channel: ${channel.name}, processed ${currentChannel}`)
                console.log(`Finished with channel: ${channel.name}, processed ${currentChannel}`)

                if (currentChannel == textChannels.size) {
                    //console.log(`recieved all messages! Total ${allMessages.size}`)

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

    trainOnMessage(content)

    console.log(words.length)

    console.log(`Bot trained!`)
}

function trainOnMessage (message) {
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
