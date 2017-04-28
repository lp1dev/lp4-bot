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
        for (let i = 0; i < memories.length; i++){
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
    }

    function            getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function            answerUsingAnswers(msg, match, answers){
	    var chatId = msg.chat.id
	    var choice = getRandomInt(0, answers.length) - 1
	    var resp = answers[choice == -1 ? choice + 1 : choice];
        console.log('answers, choice', answers, choice)
	    bot.sendMessage(chatId, resp);
    }

    function            match_learned(msg){
        var status = false
        var raw_str;
        if (undefined !== msg.text)
            raw_str = msg.text.toLowerCase()
        for (var value in learned){
            if (raw_str &&
                ((raw_str.indexOf(config.name)!== -1 || msg.chat.type === 'private') &&
                 raw_str.indexOf(value) !== -1)) {
                answerUsingAnswers(msg, null, learned[value].answers)
                status = true
            }
        }
        return status
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

    function            handleProcessed(questions, verbs, subjects, adjectives, msg){
        var done = false;
        var index = 0;
        
        while (!done) {
            var verb = verbs[index]
            var question = questions[index]
            var subject = subjects[index]
            console.log('sentence ' + index, question, verb, subject, adjectives)
            if (undefined === verb) {
                done = true
            }
            else{
                var path = config.verbs_dir + '/' + verb;
                if (fs.existsSync(path + '.js')){
                    method = require(path).action
                    return method(question, verb, subject, adjectives, msg.from.first_name)
                }
                else{
                    console.log('path : ', path)
                    return 'I\'m sorry I don\t know this verb.'
                }
            }
            index++
        }
    }
    
    function            onMessage(msg){
        console.log('message : ', msg)
        storeConversation(msg)
        if (msg.text !== undefined) {
            if (!match_learned(msg)) {
                var processed = nlp.process(msg.text, msg.from.first_name)
                var resp = handleProcessed(processed.questions,
                                           processed.verbs,
                                           processed.subjects,
                                           processed.adjectives,
                                           msg)
                if (undefined !== resp){
                    bot.sendMessage(msg.chat.id, resp)
                }
            }
        }
    }

    process.on('SIGINT', function() {
        console.log(config.name + " shutting down");
        process.exit();
    });
    
    init()
    bot.on('message', onMessage);
    console.log(config.name + ' ' + version + ' up and running')    
})();
