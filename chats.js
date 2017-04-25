const util               = require('util')
const execSync           = require('child_process').execSync;
const config             = require('./config.json')
const db                 = require('./db')
const not_allowed_string = "I'm sorry, I'm afraid I can't let you do that."
const s                  = util.format

var people = db.get('people')
var learned = db.get('learned')
var is_learning = undefined

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
    who: function(match, master, from){
        switch (match[2]) {
        case "you":
            return s('I am %s !', config.name);
            break
        case from.first_name:
        case "i":
        case "I":
            if (from.first_name !== undefined) {
                return master ? s('You are %s, my teacher !', from.first_name) : s('You are %s', from.first_name)
                break
            }
        default:
            if (people['names'][match[2]] !== undefined){
                var id = people['names'][match[2]]
                return s('I\'ve had %s chats with this person !', people[id].messages)
                break;
            }
            if (people['nicknames'][match[2]] !== undefined){
                var id = people['nicknames'][match[2]]
                return s('%s is %s', match[2], people[id].first_name) 
            }
            return 'Mmh, I don\'t know, I\'m sorry.'
            break;
        }
    },
    nickname: function(match, master, from){
        people['nicknames'][match[2]] = from.id
        prople[from.id].nickname = match[2]
        db.insert('people', people)
        return s('Ok ! I\'ll call you %s ! Just kidding %s ;)', from.first_name, match[2])
    },
    start_learning: function(match, master, from){
        if (undefined === learned[match[2].toLowerCase()]){
            learned[match[2].toLowerCase()] = {from: from.id, answers:[]}
        }
        is_learning = match[2].toLowerCase()
        return s('Ok, what should I say if someone tells me %s ?', match[2])
    },
    learn_answer: function(match, master, from){
        if (undefined !== is_learning){
            learned[is_learning].answers.push(match[1])
            db.insert('learned', learned)
            return 'Ok ! Noted'
        }
        return 'Why should I say that ?'
    },
    list_learned: function(match){
        var resp = "I have learned : "
        for (var value in learned){
            resp += s('%s (with %s), ', value, people[learned[value].from].first_name)
        }
        return resp
    }
}

var entries =
    [
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
            regex: /^(hi|hello|hey)(.*?)/i,
            answers: ["Hi !", "Hello.", "Hey !"]
        },
        {
            regex: /^(thanks|thank you)(.*?)/i,
            answers: ["Well, you're welcome", "You're welcome"]
        },
        {
            regex: /call me (.+)/i,
            answer_method: methods.nickname
        },
        {
            regex: /^(learn) (.+)/i,
            answer_method: methods.start_learning
        },
        {
            regex: /should say (.+)/i,
            answer_method: methods.learn_answer
        },
        {
            regex: /what (.+) learn/i,
            answer_method: methods.list_learned
        }        
    ]

module.exports = {
    methods: methods,
    entries: entries
}
