#!/usr/bin/node

(function (){
    //constants
    const usage         = function(){
        console.error('usage : ' + process.argv[0] + '[telegram_token]')
        return 1
    }    
    if (process.argv.length < 2){
        return usage()
    }
    const TelegramBot = require('node-telegram-bot-api')
    const token = process.argv[3]
    const bot = new TelegramBot(token, {polling: true});

    bot.onText(/help (.+)/, (msg, match) => {
	console.log('help')
	const chatId = msg.chat.id;
	const rest = "I cannot help you";
	bot.sendMessage(chatId, rest);
    });
    
    bot.onText(/\/echo (.+)/, (msg, match) => {
	// 'msg' is the received Message from Telegram
	// 'match' is the result of executing the regexp above on the text content
	// of the message
	const chatId = msg.chat.id;
	const resp = match[1]; // the captured "whatever"
	// send back the matched "whatever" to the chat
	bot.sendMessage(chatId, resp);
    });

    bot.on('message', (msg) => {
	const chatId = msg.chat.id;
    });
    
})();
