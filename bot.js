#!/usr/bin/node

(function (){
    const version       = 0.01
    const name          = "lp4"
    const TelegramBot	= require('node-telegram-bot-api')
    const chats         = require('./chats')
    const config        = require('./config.json')
    const bot           = new TelegramBot(config.token, {polling: true});

    function onText(msg, match, entry){
        if (entry.answer_method !== undefined) {
            return answerUsingMethod(msg, match, entry.answer_method)
        }
        answerUsingAnswers(msg, match, entry.answers)
    }
    
    function answerUsingMethod(msg, match, method){
	    bot.sendMessage(msg.chat.id, method(match, config.master_id === msg.from.id))
    }

    function answerUsingAnswers(msg, match, answers){
        console.log(msg, match, answers);
	    var chatId = msg.chat.id;
	    var max = answers.length;
	    var min = 0;
	    var choice = Math.floor(Math.random() * (max - min)) + min
	    var resp = answers[choice];
	    bot.sendMessage(chatId, resp);
    }
    
    for (var i = 0; i < chats.entries.length; i++) {
	    (function (i){
	        var entry = chats.entries[i];
		    bot.onText(entry.regex, function (msg, match){onText(msg, match, entry)});
	    })(i);
    }

    console.log(name + ' ' + version + ' up and running')    
})();
