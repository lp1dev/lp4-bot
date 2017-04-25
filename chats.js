var methods = {
    tell: function (match){
	return match[1] + ' ' + match[2] + '!'
    }
}

var entries =
    [
	{
	    "regex": /say (.+) to (.+)/,
	    "answer_method": methods.tell
	}
    ]

module.exports = {
    methods: methods,
    entries: entries
}
