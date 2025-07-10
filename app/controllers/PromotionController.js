const Controller = require('./Controller');
const { Promotion } = require('../models');

class PromotionController extends Controller {
    constructor() {
        super();
        console.log("PromotionController initialized");
        this.model = Promotion;
    }
    
    fetchPromotions(){
        return this.model.programmes
    }
}

module.exports = PromotionController;