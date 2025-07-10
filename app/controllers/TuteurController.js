const Controller = require('./Controller');
const { Tuteur } = require('../models');

class TuteurController extends Controller {
    constructor() {
        super();
        console.log("TuteurController initialized");
        this.model = Tuteur;
    }

    async createPayment(data) {
        try {
            // Validation des données requises
            const { id_sujet, type, amount, date_debut, date_fin } = data;
            
            if (!id_sujet || !type || !amount || !date_debut || !date_fin) {
                throw new Error('Données manquantes pour le paiement');
            }

            const result = await this.model.createPayment(data);

            return {
                success: true,
                message: 'Paiement créé avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateResipiendaire(id, field, value) {
        try {
            if (!id || !field || value === undefined) {
                throw new Error('Données manquantes pour la mise à jour');
            }

            const result = await this.model.updateResipiendaire(id, field, value);

            return {
                success: true,
                message: 'Récipiendaire mis à jour avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async createStepProject(data) {
        try {
            // Validation des données requises
            const { id_sujet, tache, duree, date_debut } = data;
            
            if (!id_sujet || !tache || !duree || !date_debut) {
                throw new Error('Données manquantes pour l\'étape du projet');
            }

            const result = await this.model.createStepProject(data);

            return {
                success: true,
                message: 'Étape du projet créée avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateCommandeSujet(id, field, value) {
        try {
            if (!id || !field || value === undefined) {
                throw new Error('Données manquantes pour la mise à jour');
            }

            const result = await this.model.updateCommandeSubjet(id, field, value);

            return {
                success: true,
                message: 'Commande sujet mise à jour avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async updateSujet(id, field, value) {
        try {
            if (!id || !field || value === undefined) {
                throw new Error('Données manquantes pour la mise à jour');
            }

            const result = await this.model.updateSubjet(id, field, value);

            return {
                success: true,
                message: 'Sujet mis à jour avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = TuteurController;