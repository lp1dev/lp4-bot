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
                adjectives: []
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
            adjectives: []
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

    function            handleProcessed(p, msg){
        var done = false;
        var index = 0;
        
        while (!done) {
            var verb = p.verbs[index]
            var question = p.questions[index]
            var subject = p.subjects[index]
            console.log('sentence ' + index, question, verb, subject, p.adjectives)
            if (undefined === verb) {
                done = true
            }
            else{
                var path = config.verbs_dir + '/' + verb;
                if (fs.existsSync(path + '.js')){
                    method = require(path).action
                    var resp =  method({adjectives: p.adjectives,
                                        question: question,
                                        subject: subject,
                                        extra: p.extra}, msg.from.first_name)
                    if (undefined !== resp){
                        bot.sendMessage(msg.chat.id, resp)
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
