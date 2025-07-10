const UserModel = require('./UserModel');
const PromotionModel = require('./PromotionModel');
const TuteurModel = require('./TuteurModel');
const DirecteurModel = require('./DirecteurModel');

module.exports = {
    User: new UserModel(),
    Promotion: new PromotionModel(),
    Tuteur: new TuteurModel(),
    Directeur: new DirecteurModel()
};
