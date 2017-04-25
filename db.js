(function (){
    const fs = require('fs')
    const config = require('./config.json')
    const file = config.db_file;
    
    module.exports = {
        insert: function(key, value){
            if (!fs.existsSync(file)){
                var data = {}
                data[key] = value;
                fs.appendFileSync(file, JSON.stringify(data))
            }
            else{
                var data = require('./' + file)
                data[key] = value;
                fs.writeFileSync(file, JSON.stringify(data))
            }
        },
        get: function(key){
            if (fs.existsSync(file))
                return require('./' + file)[key]
        }
    }
})();
