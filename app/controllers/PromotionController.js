const Controller = require('./Controller');
const { Promotion } = require('../models');

class PromotionController extends Controller {
    constructor() {
        super();
        console.log("PromotionController initialized");
        this.model = Promotion;
    }

    // Autres méthodes pour gérer les promotions peuvent être ajoutées ici
}

module.exports = PromotionController;