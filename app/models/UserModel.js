const Model = require('./Model');

class UserModel extends Model {
    constructor() {
        super();
        console.log("UserModel initialized");
    }

}

module.exports = UserModel;