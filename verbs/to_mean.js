(function (){
    const db        = require('../db.js')
    const config    = require('../config.json')
    const s         = require('util').format

    function to_mean(p, from) {
        console.log('to mean', p)
        v = db.get('vocabulary')
        let adjective = p.adjectives[0]
        let synonyms = []
        let index = 0
        p.extra.forEach((word) => {
            if (undefined === adjective && index++ === 0) {
                adjective = word
            }
            else {
                synonyms.push(word)
            }
        })

	if (v.adjectives[adjective] === undefined) {
            if (v.adjectives[synonyms[0]] !== undefined) {
		let tmp = adjective
		adjective = synonyms[0]
		synonyms = tmp
            }
	    v.adjectives[adjective] = {synonyms: []}
	}
	
	synonyms.forEach((synonym) => {
	    if (v.adjectives[synonym] === undefined) {
		v.adjectives[synonym] = {synonyms: []}
	    }
	    v.adjectives[adjective].synonyms.push(synonym)
	    v.adjectives[synonym].synonyms.push(adjective)
	})
        db.insert('vocabulary', v)
        return s('Ok, being %s is like being %s', adjective, synonyms)
    }
    
    module.exports = {name: 'to_mean', action: to_mean, regex: '(means|is like)'}
})()
