const TuteurModel = require('./TuteurModel');

class DirecteurModel extends TuteurModel {
    constructor() {
        super();
        console.log("DirecteurModel initialized");
        this.directeurs = [];
    }

    createSujet(sujetData) {
        //sujet(	id	titre	description	status	date_fin	theme	id_promotion	id_annee	)
        try {
            const result = this.db.query(`INSERT INTO sujet (titre, description, status, date_fin, theme, id_promotion, id_annee) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [sujetData.titre, sujetData.description, sujetData.status, sujetData.date_fin, sujetData.theme, sujetData.id_promotion, sujetData.id_annee]);
            return result;
        } catch (error) {
            console.error("Error creating sujet:", error);
            throw error;
        }

    }

    createResipiendaire(resipiendaireData) {
        // resipiendaire(	id	id_sujet	id_etudiant	mdp	role)
        try {
            const result = this.db.query(`INSERT INTO resipiendaire (id_sujet, id_etudiant, mdp, role) VALUES (?, ?, ?, ?)`, 
                [resipiendaireData.id_sujet, resipiendaireData.id_etudiant, resipiendaireData.mdp, resipiendaireData.role]);
            return result;
        } catch (error) {
            console.error("Error creating resipiendaire:", error);
            throw error;
        }

    }

    createTuteur(tuteurData) {
        // tuteur_sujet(id	id_sujet	id_agent	type)
        try {
            const result = this.db.query(`INSERT INTO tuteur_sujet (id_sujet, id_agent, type) VALUES (?, ?, ?)`, 
                [tuteurData.id_sujet, tuteurData.id_agent, tuteurData.type]);
            return result;
        } catch (error) {
            console.error("Error creating tuteur:", error);
            throw error;
        }
    }

    createStage(stageData) {
        //stage(	id	designation	id_promotion	montant	date_debut	date_fin	url_guide	id_annee	description)
        try {
            const result = this.db.query(`INSERT INTO stage (designation, id_promotion, montant, date_debut, date_fin, url_guide, id_annee, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [stageData.designation, stageData.id_promotion, stageData.montant, stageData.date_debut, stageData.date_fin, stageData.url_guide, stageData.id_annee, stageData.description]);
            return result;
            
        } catch (error) {
            console.error("Error creating stage:", error);
            throw error;
            
        }
    }
}