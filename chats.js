const util               = require('util')
const execSync           = require('child_process').execSync;
const config             = require('./config.json')
const not_allowed_string = "I'm sorry, I'm afraid I can't let you do that."
const s = util.format

function replace_pronouns(string, me, them){
    return string
        .replace(/(her|his)/, 'your')
        .replace(/\bme\b/, me)
        .replace(/\byou\b/, 'me')
        .replace(/\b(she's|he's)\b/, 'you\'re')
}

var methods = {
    tell: function (match, master, chat){
        switch (match[1]){
        case "me":
            return s('%s !', match[2] === 'to' ? match[3] : match[2])
            break
        default:
            var resp = s('%s, %s !', match[1], match[2] === 'to' ? match[3] : match[2])
            return replace_pronouns(resp, chat.first_name, match[1])
            break
        }

    },
    ping: function (match, master){
	    return master ? execSync("ping -c 3 " + match[1]) : not_allowed_string;
    },
    nmap: function(match){
	    return master ? execSync("nmap " + match[2]) : not_allowed_string;
    },
    who: function(match, master, chat){
        switch (match[2]) {
        case "you":
            return s('I am %s !', config.name);
            break
        case "i":
        case "I":
            if (chat.first_name !== undefined) {
                return master ? s('You are %s, my teacher !', chat.first_name) : s('You are %s', chat.first_name)
                break
            }
        default:
            return 'Mmh, I don\'t know, I\'m sorry.'
            break;
        }
    }
}

var entries =
    [
	    {
	        regex: /say (.+) (to?) (\w+)/i,
	        answer_method: methods.tell
	    },
	    {
	        regex: /tell (\w+) (to?)(.+)/i,
	        answer_method: methods.tell
	    },
        {
            regex: /tell (\w+) (.+)/i,
            answer_method: methods.tell
        },
	    {
	        regex: /is (.+) up/i,
	        answer_method: methods.ping
	    },
	    {
	        regex: /ping (.+)/i,
	        answer_method: methods.ping
	    },
	    {
	        regex: /ports are open on (.+)/i,
	        answer_method: methods.nmap
	    },
	    {
	        regex: /how (\w+) you/i,
	        answers : ["Pretty well ! Thanks", "not too bad", "Fine ! Ta", "I'm fine :), wbu ?"]
	    },
        {
            regex: /who (\w+) (\w+)/i,
            answer_method: methods.who
        },
        {
            regex: /bot(.*?)/i,
            answers: ["Yep ?", "It's me !", "What can I do you for ?"]
        },
        {
            regex: /(\bhi|hello|hey\b)(.*?)/i,
            answers: ["Hi !", "Hello.", "Hey !"]
        },
        {
            regex: /(\bthanks|thank you\b)(.*?)/i,
            answers: ["Well, you're welcome", "You're welcome"]
        }
    ]

module.exports = {
    methods: methods,
    entries: entries
}
