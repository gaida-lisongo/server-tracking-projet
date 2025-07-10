const Model = require('./Model');

class SectionModel extends Model {
    constructor() {
        super();
        console.log("SectionModel initialized");
        this.sections = [];
        this.section = {
            id: null,
            designation: null,
            id_agent: null,
            description: null,
            m_titre: null,
            chef_nom: null,
            prenom: null,
            matricule: null,
            grade: null,
            telephone: null,
            e_mail: null,
            avatar: null,
            m_desc: null
        };

        this.init();
    }

    async init() {
        try {
            const sections = await this.getAllSections();
            this.sections = sections;
            console.log("Sections initialized:", this.sections);
        } catch (error) {
            console.error("Error initializing sections:", error);
        }
    }

    async getAllSections() {
        try {
            const sections = await this.db.query(`SELECT s.*, m.designation AS 'm_titre', m.id_agent, CONCAT(chef.nom, ' ', chef.post_nom) AS 'chef_nom', chef.prenom, chef.matricule, chef.grade, chef.telephone, chef.e_mail, chef.avatar, m.description AS 'm_desc'
                    FROM section s
                    INNER JOIN mention m ON m.id = s.id_mention
                    INNER JOIN agent chef ON chef.id = m.id_agent
                `);
            return sections.data || [];
        } catch (error) {
            console.error("Error fetching sections:", error);
            throw error;
        }
    }

    async getSectionById(id) {
        const section = this.sections.find(section => section.id === id) || null;
        if (section) {
            return section;
        } else {
            try {
                const result = await this.db.query(`SELECT s.*, m.designation AS 'm_titre', m.id_agent, CONCAT(chef.nom, ' ', chef.post_nom) AS 'chef_nom', chef.prenom, chef.matricule, chef.grade, chef.telephone, chef.e_mail, chef.avatar, m.description AS 'm_desc'
                        FROM section s
                        INNER JOIN mention m ON m.id = s.id_mention
                        INNER JOIN agent chef ON chef.id = m.id_agent
                        WHERE s.id = ?`, [id]);
                return (result.data && result.data.length > 0) ? result.data[0] : null;
            } catch (error) {
                console.error("Error fetching section by ID:", error);
                throw error;
            }
        }
    }
}

module.exports = SectionModel;
