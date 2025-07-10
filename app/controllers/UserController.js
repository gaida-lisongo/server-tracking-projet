const Controller = require('./Controller');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
//crypt de base

//DotEnv
require('dotenv').config();

// Access environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class UserController extends Controller {
    constructor() {
        super();
        console.log("UserController initialized");
        this.model = User;
    }

    cryptePassword(password){
        // Use crypto to hash the password with SHA1
        return crypto.createHash('sha1').update(password).digest('hex');
    }

    generateToken({id, matricule, nom}){
        // Generate a JWT token with user information
        try {
            // Create payload with user details
            const payload = {
                id,
                matricule,
                nom
            };
            
            // Sign the token with the secret key and set expiration
            const token = jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );
            
            return token;
        } catch (error) {
            console.error('Error generating token:', error.message);
            throw new Error('Failed to generate authentication token');
        }
    }

    async authUser({matricule, secure}){
        try {
            // Validation des paramètres
            if (!matricule || !secure) {
                throw new Error('Matricule et mot de passe requis');
            }

            // Initialiser le modèle
            await this.model.init();

            // Chercher l'étudiant par matricule
            const etudiant = this.model.etudiants.find(e => 
                e.profile.matricule === matricule
            );

            if (!etudiant) {
                throw new Error('Étudiant non trouvé');
            }

            // Vérifier le mot de passe
            const hashedPassword = this.cryptePassword(secure);
            if (etudiant.profile.secure !== hashedPassword) {
                throw new Error('Mot de passe incorrect');
            }

            // Générer le token
            const token = this.generateToken({
                id: etudiant.id,
                matricule: etudiant.profile.matricule,
                nom: `${etudiant.profile.nom} ${etudiant.profile.post_nom}`
            });

            return {
                success: true,
                token: token,
                user: etudiant
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async debitSolde({id, amount}){
        try {
            // Validation des paramètres
            if (!id || !amount) {
                throw new Error('ID étudiant et montant requis');
            }

            if (amount <= 0) {
                throw new Error('Le montant doit être positif');
            }

            // Récupérer l'étudiant par ID
            await this.model.getEtudiantById(id);

            if (!this.model.etudiant) {
                throw new Error('Étudiant non trouvé');
            }

            // Vérifier si le solde est suffisant
            const soldeActuel = parseFloat(this.model.etudiant.profile.solde);
            if (soldeActuel < amount) {
                throw new Error('Solde insuffisant');
            }

            // Calculer le nouveau solde
            const nouveauSolde = soldeActuel - parseFloat(amount);

            await this.model.updateUser(id, 'solde', nouveauSolde);
            // Mettre à jour le solde (ici vous devriez ajouter une méthode updateSolde dans votre modèle)
            // Pour l'instant, on met à jour localement
            this.model.etudiant.profile.solde = nouveauSolde;

            return {
                success: true,
                message: 'Solde débité avec succès',
                data: {
                    id: id,
                    solde_precedent: soldeActuel,
                    montant_debite: parseFloat(amount),
                    nouveau_solde: nouveauSolde
                }
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async commandeTFE(data){
        try {
            // Validation des données requises
            const { id_payment, id_resipiendaire, date_cmd, phone, ref, orderNumber, description } = data;
            
            if (!id_payment || !id_resipiendaire || !date_cmd || !phone || !ref || !orderNumber) {
                throw new Error('Données manquantes pour la commande TFE');
            }

            // Créer la commande TFE via le modèle
            const result = await this.model.createCommandeTFE(data);

            return {
                success: true,
                message: 'Commande TFE créée avec succès',
                data: result
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async commandeTravail(data){
        try {
            // Validation des données requises
            const { id_travail, id_etudiant, statut, date_created, reference, resultat, observation, resolution } = data;
            
            if (!id_travail || !id_etudiant || !statut || !date_created || !reference) {
                throw new Error('Données manquantes pour la commande Travail');
            }

            // Créer la commande Travail via le modèle
            const result = await this.model.createCommandeTravail(data);

            return {
                success: true,
                message: 'Commande Travail créée avec succès',
                data: result
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }    
    
    async commandeNote(data){
        try {
            // Validation des données requises
            const { id_charge, id_etudiant, date_created, statut, reference } = data;
            
            if (!id_charge || !id_etudiant || !date_created || !statut || !reference) {
                throw new Error('Données manquantes pour la commande Note');
            }

            // Créer la commande Note via le modèle
            const result = await this.model.createCommandeNote(data);

            return {
                success: true,
                message: 'Commande Note créée avec succès',
                data: result
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Ajouter une méthode pour créer une commande Stage
    async commandeStage(data){
        try {
            const { id_etudiant, lieu_stage, nom_destinaire, titre_destinaire, date_created, ref, orderNumber, sexe_destinataire, statut, observation, id_stage, type } = data;
            
            if (!id_etudiant || !lieu_stage || !nom_destinaire || !date_created || !ref || !id_stage) {
                throw new Error('Données manquantes pour la commande Stage');
            }

            const result = await this.model.createCommandeStage(data);

            return {
                success: true,
                message: 'Commande Stage créée avec succès',
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

module.exports = UserController;
