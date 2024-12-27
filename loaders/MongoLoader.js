const loader = require('./_common/fileLoader');

module.exports = class MongoLoader {
    constructor({ schemaExtension = 'mongoModel.js' }){
        this.schemaExtension = schemaExtension
    }

    load(){
        /** load Mongo Models */
        const models = loader(`./managers/entities/**/${this.schemaExtension}`);
        return models
    }
}