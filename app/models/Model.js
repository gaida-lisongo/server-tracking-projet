const db = require('../utils/db');

class Model {
    constructor() {
        this.db = db;
        console.log("Model initialized");
    }
}

module.exports = Model;