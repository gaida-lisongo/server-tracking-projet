const TuteurController = require('./TuteurController');
const { Directeur } = require('../models');

class DirecteurController extends TuteurController {
    constructor() {
        super();
        console.log("DirecteurController initialized");
        this.model = Directeur;
    }

    async createSujet(data) {
        try {
            // Validation des données requises
            const { titre, description, status, date_fin, theme, id_promotion, id_annee } = data;
            
            if (!titre || !description || !status || !date_fin || !theme || !id_promotion || !id_annee) {
                throw new Error('Données manquantes pour la création du sujet');
            }

            const result = await this.model.createSujet(data);

            return {
                success: true,
                message: 'Sujet créé avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async createResipiendaire(data) {
        try {
            // Validation des données requises
            const { id_sujet, id_etudiant, mdp, role } = data;
            
            if (!id_sujet || !id_etudiant || !mdp || !role) {
                throw new Error('Données manquantes pour la création du récipiendaire');
            }

            const result = await this.model.createResipiendaire(data);

            return {
                success: true,
                message: 'Récipiendaire créé avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async createTuteur(data) {
        try {
            // Validation des données requises
            const { id_sujet, id_agent, type } = data;
            
            if (!id_sujet || !id_agent || !type) {
                throw new Error('Données manquantes pour l\'association du tuteur');
            }

            const result = await this.model.createTuteur(data);

            return {
                success: true,
                message: 'Tuteur associé avec succès',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async createStage(data) {
        try {
            // Validation des données requises
            const { designation, id_promotion, montant, date_debut, date_fin, url_guide, id_annee, description } = data;
            
            if (!designation || !id_promotion || !montant || !date_debut || !date_fin || !id_annee) {
                throw new Error('Données manquantes pour la création du stage');
            }

            const result = await this.model.createStage(data);

            return {
                success: true,
                message: 'Stage créé avec succès',
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

module.exports = DirecteurController;