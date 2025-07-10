const Controller = require('./Controller');
const { User } = require('../models');

class UserController extends Controller {
    constructor() {
        super();
        console.log("UserController initialized");
        this.model = User;
    }

}

module.exports = UserController;
