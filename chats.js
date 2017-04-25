var methods = {
    tell: function (match){
	if (match[1] !== 'me') {
	    return match[1] + ', ' + match[2] + '!'
	}
	else {
	    return match[2] + '!'
	}
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
	}
    ]

module.exports = {
    methods: methods,
    entries: entries
}
