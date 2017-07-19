(function (){
    const db        = require('../db.js')
    const config    = require('../config.json')
    const s         = require('util').format
    const person    = require('../concepts/person')
    let m           = db.get('memory')

    function who(p, from) {
        let person = person.get(p.subject)
        if (person) {
            let resp = m.people[id].bio
            for (let i = 0; i < person.adjectives.length; i++){
                let adjective = person.adjectives[i]
                resp += s(` this person is %s according to %s`, adjective.adjective, adjective.from)
            }
            return resp
        }
        return s(`I am sorry, I do not know`)
    }

    function how(p, from) {
        let person = person.get(p.subject)
        if (person) {
            if (person.status !== null) {
                return s(`%s is %s`, p.subject, person.status)
            }
            return s(`I do not know how is %s`, p.subject)
        }
    }
    
    function to_be(p, from) {
        console.log('to be', p.question, p.subject, p.adjectives)
        m = db.get('memory')
        
        if (undefined === p.question) {
            if (undefined !== p.subject) {
                let person = person.get(p.subject)
                if (undefined !== person){
                    if (p.adjectives.length === 0){
                        if (p.extra !== undefined){
                            return s('I did not understand the adjective %s', p.extra)
                        }
                    }
                    else {
                        p.adjectives.forEach((adjective) => {
//                            m.people[person].adjectives.push({from: from, adjective: adjective});
                            person.setStatus(adjective)
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
        case 'how':
            return how(p)
            break
        }
    }
    
    module.exports = {name: 'to_be', action: to_be, regex: '(is|are|being|to be|am)'}
})()
