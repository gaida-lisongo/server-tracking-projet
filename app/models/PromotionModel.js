const SectionModel = require('./SectionModel');

class PromotionModel extends SectionModel {
    constructor() {
        super();
        console.log("PromotionModel initialized");
        this.programmes = [];
        this.init();
    }

    async init(){
        try {
            const promotionsData = await this.getAllPromotions();
            const promotions = await Promise.all(promotionsData.map(async promo => {
                return {
                    ...promo,
                    travaux: await this.getTravauxByPromotionId(promo.id) || [],
                    notes: await this.getNotesByPromotionId(promo.id) || [],
                    stages: await this.getStagesByPromotionId(promo.id) || [],
                    sujets: await this.getSujetsByPromotionId(promo.id) || []
                };
            }));
            const sections = await this.getAllSections();
            this.programmes = sections.map(section => {
                return {
                    ...section,
                    promotions: promotions.filter(promo => {
                        console.log(`Debugging promotion section match: ${promo.id_section} === ${section.id} : `, promo);
                        return promo.id_section === section.id
                    })
                };
            });
        } catch (error) {
            console.error('Error initializing PromotionModel:', error);
            throw error;
        }
    }

    async getAllPromotions() {
        try {
            const query = `SELECT p.*, n.intitule AS 'classe', n.systeme
                        FROM promotion p 
                        INNER JOIN niveau n ON n.id = p.id_niveau`;
            const result = await this.db.query(query);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error;
        }
    }

    async getAllProgrammes() {
        try {
            return this.programmes;
        } catch (error) {
            console.error('Error fetching programmes:', error);
            throw error;
        }
    }

    async getTravauxByPromotionId(id) {
        try {
            const query = `SELECT t.*, m.designation AS 'cours', m.credit, m.semestre, u.designation AS 'unite', c.penalites_trvx
                        FROM travail t
                        INNER JOIN charge_horaire c ON c.id = t.id_charge
                        INNER JOIN matiere m ON m.id = c.id_matiere
                        INNER JOIN unite u ON u.id = m.id_unite
                        WHERE u.id_promotion = ?`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching travaux by promotion ID:', error);
            throw error;
        }
    }

    async getNotesByPromotionId(id) {
        try {
            const query = `SELECT c.*, m.designation AS 'cours', m.credit, m.semestre, u.designation AS 'unite'
                FROM charge_horaire c
                INNER JOIN matiere m ON m.id = c.id_matiere
                INNER JOIN unite u ON u.id = m.id_unite
                WHERE c.url_document != NULL AND u.id_promotion = ?`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching notes by promotion ID:', error);
            throw error;
        }
    }

    async getSujetsByPromotionId(id) {
        try {
            const query = `SELECT s.*, t.type, CONCAT(agent.grade, ' ', agent.nom, ' ', agent.post_nom) AS 'tuteur_nom', agent.avatar, agent.e_mail, agent.telephone, agent.matricule, t.id_agent
                    FROM sujet s
                    LEFT JOIN tuteur_sujet t ON t.id_sujet = s.id
                    LEFT JOIN agent ON agent.id = t.id_agent
                    WHERE s.id_promotion = ? AND s.id_annee = (SELECT annee.id FROM annee ORDER BY annee.id DESC LIMIT 1)`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching sujets by promotion ID:', error);
            throw error;
        }
    }

    async getStagesByPromotionId(id) {
        try {
            const query = `SELECT *
                FROM stage
                WHERE stage.id_promotion = ? AND stage.id_annee = (SELECT annee.id FROM annee ORDER BY annee.id DESC LIMIT 1)`;
            const result = await this.db.query(query, [id]);
            return result.data || [];
        } catch (error) {
            console.error('Error fetching stages by promotion ID:', error);
            throw error;
        }
    }

}


module.exports = PromotionModel;