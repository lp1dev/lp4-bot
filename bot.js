#!/usr/bin/node

(function (){
    //constants
    const fs		= require('fs')
    const TelegramBot	= require('node-telegram-bot-api')
    const chats		= require('./chats')
    const usage         = function(){
        console.error('usage : ' + process.argv[0] + '[telegram_token]')
        return 1
    }    
    if (process.argv.length < 2){
        return usage()
    }
    const token = process.argv[2]
    const bot = new TelegramBot(token, {polling: true});

    bot.onText(/help (.+)/, (msg, match) => {
	console.log('help')
	const chatId = msg.chat.id;
	const rest = "I cannot help you";
	bot.sendMessage(chatId, rest);
    });
    
    bot.onText(/\/echo (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const resp = match[1];
	bot.sendMessage(chatId, resp);
    });

    bot.on('message', (msg) => {
	const chatId = msg.chat.id;
    });

    for (var i = 0; i < chats.entries.length; i++) {
	var entry = chats.entries[i];
	if (undefined === entry.answers){
	    bot.onText(entry.regex,
		       function (msg, match) {
			   bot.sendMessage(msg.chat.id,
					   entry.answer_method(match));
		       });
	}
	else {
	    bot.onText(entry.regex,
			   function (msg, match){
			       answer(msg, match, entry.answers)
			   });
	}
    }

    function answer(msg, match, answers){
	console.log(msg, match, answers);
	const chatId = msg.chat.id;
	const resp = match[1];
	bot.sendMessage(chatId, resp);
    }
        
})();
