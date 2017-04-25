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
        var raw_str = msg.text.toLowerCase()
        for (var value in learned){
            if (raw_str.indexOf(config.name)!== -1 && raw_str.indexOf(value) !== -1){
                answerUsingAnswers(msg, null, learned[value].answers)
            }
        }
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
        if (msg.text !== undefined){
            match_learned(msg)
        }
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
