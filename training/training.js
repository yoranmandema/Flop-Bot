let allMessages
let discord
let postgres
let debug 
let textChannels
let words = {}
let questionWord = ''

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
        trainOnMessage(message)
    })

    console.log(words.length)

    console.log(`Bot trained!`)
}

function processWord (word, next) {
    if (words[word] === undefined) {
        words[word] = []
    } else {
        words[word].push(next)
    }
}

function trainOnMessage (message) {
    
    let filteredMessage = message.content

    // User mention
    if (/<@(\d+)>/g.test(filteredMessage)) {
        filteredMessage = message.content.replace(/<@(\d+)>/g, (full, id) => {
            let member = message.guild.members.get(id)

            if (member.nickname != undefined) {
                return member.nickname
            } else {
                return member.user.username
            }
        })
    }

    // Role mention
    if (/<@&(\d+)>/g.test(filteredMessage)) {
        filteredMessage = message.content.replace(/<@&(\d+)>/g, (full, id) => {
            let role = message.guild.roles.get(id)

            return role.name
        })
    }

    filteredMessage = filteredMessage.replace(/\s*\?/g,'?')

    let wordsInMessage = filteredMessage.split(' ')

    registerAnswer(wordsInMessage[0])

    for (let i = 0; i < wordsInMessage.length - 1; i++) {
        let currentWord = wordsInMessage[i]
        let nextWord = wordsInMessage[i + 1]

        processWord(currentWord,nextWord)
    }

    let lastWord = wordsInMessage[wordsInMessage.length - 1]

    if (lastWord.endsWith('?')) {
        console.log('Is question')

        questionWord = lastWord.replace(/\?+/g,'')
    } else {
        questionWord = ''
    }
}

function registerAnswer (word) {
    if (questionWord === '') return;

    console.log('Registered question: ' + questionWord + ' ' +  word)

    processWord(questionWord,word)
}

exports.trainOnMessage = trainOnMessage
