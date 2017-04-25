#!/usr/bin/node

(function (){
    const version       = 0.01
    const TelegramBot	= require('node-telegram-bot-api')
    const chats         = require('./chats')
    const config        = require('./config.json')
    const db            = require('./db')
    const bot           = new TelegramBot(config.token, {polling: true});
    var people          = db.get('people')
    var learned         = db.get('learned')
 
    function            init(){
        if (learned === undefined){
            learned = {}
            db.insert('learned', learned)
        }
    }
    
    function            onText(msg, match, entry){
        if (config.debug){
            console.log('onText :: match, msg', match, msg)
        }
        if (entry.answer_method !== undefined) {
            return answerUsingMethod(msg, match, entry.answer_method)
        }
        answerUsingAnswers(msg, match, entry.answers)
    }
    
    function            answerUsingMethod(msg, match, method){
	    bot.sendMessage(msg.chat.id, method(match, config.master_id === msg.from.id, msg.from))
    }

    function            answerUsingAnswers(msg, match, answers){
	    var chatId = msg.chat.id
	    var max = answers.length;
	    var min = 0;
	    var choice = Math.floor(Math.random() * (max - min)) + min
	    var resp = answers[choice];
	    bot.sendMessage(chatId, resp);
    }

    function            match_learned(msg){
        if (undefined !== learned[msg.text.toLowerCase()])
            answerUsingAnswers(msg, null, learned[msg.text.toLowerCase()].answers)
    }
    
    function            onMessage(msg){
        var id = msg.from.id
        if (undefined === people){
            people = {}
        }
        if (undefined === people[id]){
            people[id] = {
                first_name: msg.from.first_name,
                messages: 0
            }
        }
        people[id].messages++;
        if (people['names'] === undefined){
            people['names'] = {}
            people['nicknames'] = {}
        }
        people['names'][msg.from.first_name] = id
        db.insert('people', people)
        match_learned(msg)
    }
    
    for (var i = 0; i < chats.entries.length; i++) {
	    (function (i){
	        var entry = chats.entries[i];
		    bot.onText(entry.regex, function (msg, match){onText(msg, match, entry)});
	    })(i);
    }
    
    bot.on('message', onMessage);
    
    init()    
    console.log(config.name + ' ' + version + ' up and running')    
})();
