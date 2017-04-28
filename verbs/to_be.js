(function (){
    const db        = require('../db.js')
    const config    = require('../config.json')
    const s         = require('util').format
    let m           = db.get('memory')

    function who(p, from) {
        if (undefined !== m.people.names[p.subject]) {
            let id = m.people.names[p.subject]
            let resp = m.people[id].bio
            for (let i = 0; i < m.people[id].adjectives.length; i++){
                let adjective = m.people[id].adjectives[i]
                resp += s(` this person is %s according to %s`, adjective.adjective, adjective.from)
            }
            return resp
        }
        return s(`I am sorry, I do not know %s`, p.extra)
    }
    
    function to_be(p, from) {
        console.log('to be', p.question, p.subject, p.adjectives)
        m = db.get('memory')
        
        if (undefined === p.question) {
            if (undefined !== p.subject) {
                let person = m.people.names[p.subject]                
                if (undefined !== person){
                    if (p.adjectives.length === 0){
                        if (p.extra !== undefined){
                            return s('I did not understand the adjective %s', p.extra)
                        }
                    }
                    else {
                        p.adjectives.forEach((adjective) => {
                            m.people[person].adjectives.push({from: from, adjective: adjective});
                        })
                    }
                    return `Ok !`
                }
            }
        }
        switch (p.question) {
        case 'who':
            return who(p)
            break
        }
        return 'I understood the verb to be, but not the rest'
    }
    
    module.exports = {name: 'to_be', action: to_be, regex: '(is|are|being|to be|am)'}
})()
