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
    
    bot.on('message', (msg) => {
	const chatId = msg.chat.id;
    });

    for (var i = 0; i < chats.entries.length; i++) {
	(function (i){
	    var entry = chats.entries[i];
	    if (undefined === entry.answers &&
		undefined !== entry.answer_method){
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
	})(i);
    }

    function answer(msg, match, answers){
	console.log(msg, match, answers);
	var chatId = msg.chat.id;
	var max = answers.length;
	var min = 0;
	var choice = Math.floor(Math.random() * (max - min)) + min
	var resp = answers[choice];
	bot.sendMessage(chatId, resp);
    }

    console.log('up and running')
    
})();
