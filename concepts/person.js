(function (){
    'use strict'

    const db        = require('../db')
    let m           = db.get('memory')
    let exports     = {}
    
    exports.init    = init
    exports.create  = create
    exports.get     = get

    function        setStatus(id, status){
        m.people[id].status = status
    }
    
    function        get(name) {
        var id = m.people['nicknames'][name]
        if (undefined !== id) {
            m.people[id].setStatus = function(status){
                setStatus(id, status)
            }
            return m.people[id]
        }
        id = m.people['names'][name]
        if (undefined !== id) {
            return m.people[id]
        }
    }

    function        create(id, first_name, bio, status) {
        m.people[id] = {
            first_name: first_name,
            messages: 0,
            conversations: {},
            adjectives: [],
            bio: bio || config.default_bio,
            status: status || null
        }
        m.people['names'][first_name.toLowerCase()] = id
        db.insert('memory', m)
    }
    
    function        init() {
        if (undefined === m.people[0]){
            create(0, config.name, config.bot_bio, 'good')
            if (undefined === m.people['names'])
                m.people['names'] = {}
            if (undefined === m.people['nickname'])
                m.people['nicknames'] = {}
            m.people['names'][config.name] = 0
        }
        db.insert('memory', m)
    }

    module.exports = exports
})()
