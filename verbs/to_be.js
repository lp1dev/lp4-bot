(function (){
    const db = require('../db.js')
    const config = require('../config.json')

    function who(question, verb, subject, from) {
        var people = db.get('people')
        if (undefined === subject){
            return 'Who is what ?'
        }
        if (undefined !== people.names[subject]) {
            var id = people.names[subject]
            var resp = people[id].bio
            for (var i = 0; i < people[id].adjectives.length; i++){
                var adjective = people[id].adjectives[i]
                resp += 'This person is ' + adjective.adjective + ' according to ' + adjective.from
            }
            return resp
        }
        if (undefined !== people.nicknames[subject]) {
            return JSON.stringify(people.nicknames[subject])
        }
        return 'I am sorry, I do not know '+ subject
    }
    
    function to_be(question, verb, subject, adjective, from) {
        var people = db.get('people')
        console.log('to be', question, verb, subject)

        if (undefined === question) {
            if (undefined !== subject && undefined !== adjective) {
                var person = people.names[subject]
                if (undefined !== person){
                    people[person].adjectives.push({from: from, adjective: adjective})
                    return 'Ok, ' + from +' I will remember that you said ' + subject + ' is ' + adjective
                }
                else {
                    return 'I am sorry, I do not know this person'
                }
            }
            return 'I understood the verb to be, but could not identify the question.'
        }
        switch (question) {
        case 'who':
            return who(question, verb, subject)
            break
        }
        return 'I understood the verb to be, but not the rest'
    }
    
    module.exports = {name: 'to_be', action: to_be, regex: '\b(is|are|being|to be|am)\b'}
})()
