const Model = require('./Model');

class UserModel extends Model {
    constructor() {
        super();
        console.log("UserModel initialized");
        this.etudiants = [];
        this.etudiant = {
            id: null,
            profile: {
                nom: '',
                post_nom: '',
                prenom: '',
                matricule: '',
                sexe: '',
                mdp: '',
                vision: '',
                lieu_naissance: '',
                date_naiss: '',
                telephone: '',
                adresse: '',
                e_mail: '',
                avatar: '',
                frais_acad: 0,
                solde: 0,
                frais_connexe: 0,
                secure: '',
            },
            couverture: {},
            rapport: {},
            activities: [],
            tfe: {},
            stage: {},
        };
    }

    async init() {
        const etudiantsData = await this.getAllEtudiants();
        this.etudiants = await Promise.all(
            etudiantsData.map(async etudiant => {
                this.getCommandesStageByEtudiantId(etudiant.id);
                const currentEtudiant = {
                    id: etudiant.id,
                    profile: {
                        nom: etudiant.nom,
                        post_nom: etudiant.post_nom,
                        prenom: etudiant.prenom,
                        matricule: etudiant.matricule,
                        sexe: etudiant.sexe,
                        mdp: etudiant.mdp,
                        vision: etudiant.vision,
                        lieu_naissance: etudiant.lieu_naissance,
                        date_naiss: etudiant.date_naiss,
                        telephone: etudiant.telephone,
                        adresse: etudiant.adresse,
                        e_mail: etudiant.e_mail,
                        avatar: etudiant.avatar,
                        frais_acad: etudiant.frais_acad || 0,
                        solde: etudiant.solde || 0,
                        frais_connexe: etudiant.frais_connexe || 0,
                        secure: etudiant.secure || '',
                    },
                    couverture: {},
                    rapport: {},
                    activities: [],
                    tfe: {},
                    stage: {},
                    sujet: {},
                    fiche: {}
                };
                const activites = await this.getActivitesByEtudiantId(currentEtudiant.id);
                if (activites.length > 0) {
                    currentEtudiant.activities = activites;
                }

                const commandesSujet = await this.getCommandesTFEByEtudiantId(currentEtudiant.id);
                if (commandesSujet.length > 0) {
                    const couverture = commandesSujet.find(cmd => cmd.type === 'Couverture') || {};
                    const tfe = commandesSujet.find(cmd => cmd.type === 'Solde') || {};
                    const sujet = commandesSujet.find(cmd => cmd.type === 'Acompte') || {};
                    const fiche = commandesSujet.find(cmd => cmd.type === 'Enrollement') || {};
                    currentEtudiant.couverture = couverture;
                    currentEtudiant.tfe = tfe;
                    currentEtudiant.sujet = sujet;
                    currentEtudiant.fiche = fiche;
                }
                
                const commandesStage = await this.getCommandesStageByEtudiantId(currentEtudiant.id);
                if (commandesStage.length > 0) {
                    const stage = commandesStage.find(cmd => cmd.type === 'Lettre') || {};
                    const rapport = commandesStage.find(cmd => cmd.type === 'Lecture') || {};
                    currentEtudiant.stage = stage;
                    currentEtudiant.rapport = rapport;
                }
                return currentEtudiant;
            })
        );
    }

    filterCommandesByType(commandes, type) {
        return commandes.filter(commande => commande.type === type);
    }

    async getAllEtudiants() {
        try {
            const query = `SELECT e.*
                           FROM etudiant e`;
            const result = await this.db.query(query);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching etudiants:', error);
            throw error;
        }
    }

    async getEtudiantById(id) {
        const etudiant = this.etudiants.find(e => e.id === id) || null;
        if (etudiant) {
            this.etudiant = { ...etudiant };
        } else {
            try {
                const query = `SELECT e.*
                               FROM etudiant e
                               WHERE e.id = ?`;
                const result = await this.db.query(query, [id]);
                if (result.data && result.data.length > 0) {
                    const etudiantData = result.data[0];
                    this.etudiant = {
                        id: etudiantData.id,
                        profile: {
                            nom: etudiantData.nom,
                            post_nom: etudiantData.post_nom,
                            prenom: etudiantData.prenom,
                            matricule: etudiantData.matricule,
                            sexe: etudiantData.sexe,
                            mdp: etudiantData.mdp,
                            vision: etudiantData.vision,
                            lieu_naissance: etudiantData.lieu_naissance,
                            date_naiss: etudiantData.date_naiss,
                            telephone: etudiantData.telephone,
                            adresse: etudiantData.adresse,
                            e_mail: etudiantData.e_mail,
                            avatar: etudiantData.avatar,
                            frais_acad: etudiantData.frais_acad || 0,
                            solde: etudiantData.solde || 0,
                            frais_connexe: etudiantData.frais_connexe || 0,
                            secure: etudiantData.secure || '',
                        }
                    };
                } else {
                    this.etudiant = null;
                }
            } catch (error) {
                console.error('Error fetching etudiant by ID:', error);
                throw error;
            }
        }
    }

    async getRechargesByEtudiantId(id) {
        try {
            const query = `SELECT r.*
                           FROM recharge r
                           WHERE r.id_etudiant = ?`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching recharges by etudiant ID:', error);
            throw error;
        }
    }
    
    async getCommandesTFEByEtudiantId(id) {
        try {
            const query = `SELECT cmd.*, p.id_sujet, p.type, p.amount, p.date_debut, p.date_fin, r.role
                FROM commande_sujet cmd
                INNER JOIN payment_sujet p ON p.id = cmd.id_payment
                INNER JOIN resipiendaire r ON r.id = cmd.id_resipiendaire
                WHERE r.id_etudiant = ?`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching commandes TFE by etudiant ID:', error);
            throw error;
        }
    }

    async getCommandesStageByEtudiantId(id) {
        try {
            const query = `SELECT c.*, s.designation AS 'stage', s.id_promotion, s.montant, s.date_debut, s.date_fin, s.url_guide, s.id_annee, s.description
                FROM commande_stage c
                INNER JOIN stage s ON s.id = c.id_stage
                WHERE c.id_etudiant = ? AND s.id_annee = (SELECT annee.id FROM annee ORDER BY annee.id DESC LIMIT 1)`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching commandes stage by etudiant ID:', error);
            throw error;
        }
    }

    async getActivitesByEtudiantId(id) {
        try {
            const query = `SELECT *
                FROM activite_resipiendaire a
                INNER JOIN resipiendaire r ON r.id = a.id_resipiendaire
                WHERE r.id_etudiant = ?`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching activites by etudiant ID:', error);
            throw error;
        }
    }

    async createCommandeTFE(data) {
        try {
            //`id`, `id_payment`, `id_resipiendaire`, `date_cmd`, `phone`, `ref`, `orderNumber`, `description`
            const { id_payment, id_resipiendaire, date_cmd, phone, ref, orderNumber, description } = data;
            const query = `INSERT INTO commande_sujet (id_payment, id_resipiendaire, date_cmd, phone, ref, orderNumber, description)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const result = await this.db.insert(query, [id_payment, id_resipiendaire, date_cmd, phone, ref, orderNumber, description]);
            return result
        } catch (error) {
            console.error('Error creating commande TFE:', error);
            throw error;
        }
    }

    async createCommandeStage(data) {
        try {
            const { id_etudiant, lieu_stage, nom_destinaire, titre_destinaire, date_created, ref, orderNumber, sexe_destinataire, statut, observation, id_stage, type } = data;
            const query = `INSERT INTO commande_stage (id_etudiant, lieu_stage, nom_destinaire, titre_destinaire, date_created, ref, orderNumber, sexe_destinataire, statut, observation, id_stage, type)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const result = await this.db.insert(query, [id_etudiant, lieu_stage, nom_destinaire, titre_destinaire, date_created, ref, orderNumber, sexe_destinataire, statut, observation, id_stage, type]);
            return result
        } catch (error) {
            console.error('Error creating commande Stage:', error);
            throw error;
        }
    }

    async createCommandeTravail(data){
        //`commande_travail`(`id`, `id_travail`, `id_etudiant`, `statut`, `date_created`, `reference`, `resultat`, `observation`, `resolution`)
        try {
            const { id_travail, id_etudiant, statut, date_created, reference, resultat, observation, resolution } = data;
            const query = `INSERT INTO commande_travail (id_travail, id_etudiant, statut, date_created, reference, resultat, observation, resolution)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const result = await this.db.insert(query, [id_travail, id_etudiant, statut, date_created, reference, resultat, observation, resolution]);
            return result;
            
        } catch (error) {
            console.error('Error creating commande Travail', error);
            throw error;
        }
    }

    async createCommandeNote(data){
        //`commande_note`(`id`, `id_charge`, `id_etudiant`, `date_created`, `statut`, `reference`)
        try {
            const { id_charge, id_etudiant, date_created, statut, reference } = data;
            const query = `INSERT INTO commande_note (id_charge, id_etudiant, date_created, statut, reference)
                           VALUES (?, ?, ?, ?, ?)`;
            const result = await this.db.insert(query, [id_charge, id_etudiant, date_created, statut, reference]);
            return result;
        } catch (error) {
            console.error('Error creating commande Note:', error);
            throw error;
        }
    }

    async updateUser(id, col, value){
        try {
            const query = `UPDATE etudiant SET ${col} = ? WHERE id = ?`;
            const result = await this.db.update(query, [value, id]);
            if (result.success) {
                // Update the local user object if it exists
                const etudiantIndex = this.etudiants.findIndex(e => e.id === id);
                if (etudiantIndex !== -1) {
                    // Handle nested properties in profile
                    if (col.includes('.')) {
                        const [parent, child] = col.split('.');
                        if (parent === 'profile') {
                            this.etudiants[etudiantIndex].profile[child] = value;
                        }
                    } else {
                        // Direct property update
                        this.etudiants[etudiantIndex][col] = value;
                    }
                }
                return { success: true, message: 'User updated successfully' };
            }
            return { success: false, message: 'Failed to update user' };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

}

module.exports = UserModel;