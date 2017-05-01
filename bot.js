#!/usr/bin/node

(function (){
    const version       = 0.01
    const TelegramBot	= require('node-telegram-bot-api')
    const fs            = require('fs')
    const config        = require('./config.json')
    const db            = require('./db')
    const nlp           = require('./simple-nlp/nlp')
    const bot           = new TelegramBot(config.token, {polling: true})
    //knowledge
    let m               = db.get('memory')
    let context
 
    function            init(){
        let types = ['people', 'chats', 'adjectives']
        
        nlp.init()
        if (m === undefined){
            m = {}
        }
        for (let i = 0; i < types.length; i++){
            let type = types[i]
            if (undefined === m[type]) {
                m[type] = {}
            }
        }
        if (undefined === m.people[0]){
            m.people[0] = {
                first_name: config.name,
                messages: 0,
                conversations: {},
                bio: config.bot_bio,
                adjectives: [],
                status: 'good'
            }
            if (undefined === m.people['names'])
                m.people['names'] = {}
            if (undefined === m.people['nickname'])
                m.people['nicknames'] = {}
            m.people['names'][config.name] = 0
        }
        db.insert('memory', m)
    }

    function            newPerson(from){
        return {
            first_name: from.first_name,
            messages: 0,
            conversations: {},
            bio: config.default_bio,
            adjectives: [],
            status: null
        }
    }
    
    function            storeConversation(msg){
        var id = msg.from.id
        if (undefined === m.people[id]){
            m.people[id] = newPerson(msg.from)
        }
        m.people[id].conversations[msg.chat.id] = msg.chat
        m.people[id].messages++
        m.people[id].conversations[msg.chat.id] = msg.chat
        m.people['names'][msg.from.first_name.toLowerCase()] = id
    }

    function            setContext(verb, question, subject, p) {
        //verb = context.verb === undefined ? verb : context.verb
        if (["he", "him", "her", "she", "they", "it", "them"].indexOf(subject) !== -1
            && context !== undefined) {
            subject = context.subject === undefined ? subject : context.subject
        }
        return subject
    }

    function            handleProcessed(p, msg) {
        let done = false
        let index = 0

        while (!done) {
            let verb = p.verbs[index]
            let question = p.questions[index]
            let subject = p.subjects[index]
            subject = setContext(verb, question, subject, p)
            if (undefined === verb) {
                done = true
            }
            else{
                let path = config.verbs_dir + '/' + verb;
                if (fs.existsSync(path + '.js')) {
                    method = require(path).action
                    let resp =  method({adjectives: p.adjectives,
                                        question: question,
                                        subject: subject,
                                        extra: p.extra}, msg.from.first_name)
                    if (undefined !== resp){
                        context = {verb: verb, subject: subject, question: question, adjectives: p.adjectives}
                        return bot.sendMessage(msg.chat.id, resp)
                    }
                }
            }
            index++
        }
    }
    
    function            onMessage(msg){
        console.log('message : ', msg)
        storeConversation(msg)
        if (msg.text !== undefined) {
            let processed = nlp.process(msg.text, msg.from.first_name)
            console.log('processed',processed)
            handleProcessed(processed, msg)
        }
    }

    process.on('SIGINT', function() {
        console.log(config.name + " shutting down");
        process.exit();
        db.insert('memory', m)
    });
    
    init()
    bot.on('message', onMessage);
    console.log(config.name + ' ' + version + ' up and running')    
})();
