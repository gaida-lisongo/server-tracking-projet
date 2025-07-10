const UserModel = require('./UserModel');
const PromotionModel = require('./PromotionModel');

module.exports = {
    User: new UserModel(),
    Promotion: new PromotionModel()
};
