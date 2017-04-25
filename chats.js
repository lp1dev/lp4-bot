var sys = require('sys')
var execSync = require('child_process').execSync;

var methods = {
    tell: function (match){
	if (match[1] !== 'me') {
	    return match[1] + ', ' + match[2] + '!'
	}
	else {
	    return match[2] + '!'
	}
    },
    ping: function (match){
	return execSync("ping -c 3 " + match[1]);	
    },
    nmap: function(match){
	return execSync("nmap " + match[2]);
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
