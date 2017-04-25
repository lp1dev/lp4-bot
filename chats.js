const sys = require('sys')
const execSync = require('child_process').execSync;
const not_allowed_string = "I'm sorry, I'm afraid I can't let you do that."

var methods = {
    tell: function (match){
	if (match[1] !== 'me') {
	    return match[1] + ', ' + match[2] + '!'
	}
	else {
	    return match[2] + '!'
	}
    },
    ping: function (match, master){
	return master ? execSync("ping -c 3 " + match[1]) : not_allowed_string;
    },
    nmap: function(match){
	return master ? execSync("nmap " + match[2]) : not_allowed_string;
    }
}

var entries =
    [
	{
	    regex: /say (.+) to (.+)/i,
	    answer_method: methods.tell
	},
	{
	    regex: /tell (.+) to (.+)/i,
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
	    regex: /how (.+) you/i,
	    answers : ["Pretty well ! Thanks", "not too bad", "Fine ! Ta", "I'm fine :), wbu ?"]
	}
    ]

module.exports = {
    methods: methods,
    entries: entries
}
