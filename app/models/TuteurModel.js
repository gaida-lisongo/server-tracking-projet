const PromotionModel = require('./PromotionModel');

class TuteurModel extends PromotionModel {
    constructor() {
        super();
        console.log("TuteurModel initialized");
        
    }

    async createPayment(paymentData) {
        try {
            const result = await this.db.query(`INSERT INTO payment_sujet (id_sujet, type, amount, date_debut, date_fin) VALUES (?, ?, ?, ?, ?)`, 
                [paymentData.id_sujet, paymentData.type, paymentData.amount, paymentData.date_debut, paymentData.date_fin]);
            return result;
        } catch (error) {
            console.error("Error creating payment:", error);
            throw error;
        }

    }

    async updateResipiendaire(id, col, val) {
        try {
            const result = await this.db.query(`UPDATE resipiendaire SET ${col} = ? WHERE id = ?`, [val, id]);
            return result;
        } catch (error) {
            console.error("Error updating resipiendaire:", error);
            throw error;
        }
    }

    async createStepProject(stepData) {
        try {
            const result = await this.db.query(`INSERT INTO sujet_etape (id_sujet, tache, duree, date_debut) VALUES (?, ?, ?, ?)`, 
                [stepData.id_sujet, stepData.tache, stepData.duree, stepData.date_debut]);
            return result;
        } catch (error) {
            console.error("Error creating step project:", error);
            throw error;
        }
    }

    async updateCommandeSubjet(id, col, val) {
        try {
            const result = await this.db.query(`UPDATE commande_sujet SET ${col} = ? WHERE id = ?`, [val, id]);
            return result;
        } catch (error) {
            console.error("Error updating commande subject:", error);
            throw error;
        }
    }

    async updateSubjet(id, col, val) {
        try {
            const result = await this.db.query(`UPDATE sujet SET ${col} = ? WHERE id = ?`, [val, id]);
            return result;
        } catch (error) {
            console.error("Error updating subject:", error);
            throw error;
        }
    }

}

module.exports = TuteurModel;