const express = require('express');
const { UserController } = require('../controllers');
const { authenticateToken, requireSelfOrAdmin, optionalAuth } = require('../utils/auth');

const router = express.Router();

// Instancier le contrôleur
const userController = new UserController();

/**
 * POST /api/users/login
 * Authentification utilisateur
 */
router.post('/login', async (req, res) => {
    try {
        const { matricule, secure } = req.body;
        
        const result = await userController.authUser({ matricule, secure });
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la connexion'
        });
    }
});

/**
 * POST /api/users/:id/debit
 * Débiter le solde d'un utilisateur
 */
router.post('/:id/debit', authenticateToken, requireSelfOrAdmin('id'), async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        
        const result = await userController.debitSolde({ id: parseInt(id), amount });
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du débit'
        });
    }
});

/**
 * POST /api/users/commande/tfe
 * Créer une commande TFE
 */
router.post('/commande/tfe', authenticateToken, async (req, res) => {
    try {
        const result = await userController.commandeTFE(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de la commande TFE'
        });
    }
});

/**
 * POST /api/users/commande/travail
 * Créer une commande Travail
 */
router.post('/commande/travail', authenticateToken, async (req, res) => {
    try {
        const result = await userController.commandeTravail(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de la commande Travail'
        });
    }
});

/**
 * POST /api/users/commande/note
 * Créer une commande Note
 */
router.post('/commande/note', authenticateToken, async (req, res) => {
    try {
        const result = await userController.commandeNote(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de la commande Note'
        });
    }
});

/**
 * GET /api/users/:id/profile
 * Récupérer le profil complet d'un utilisateur
 */
router.get('/:id/profile', authenticateToken, requireSelfOrAdmin('id'), async (req, res) => {
    try {
        const { id } = req.params;
        
        await userController.model.getEtudiantById(parseInt(id));
        
        if (!userController.model.etudiant) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profil récupéré avec succès',
            data: userController.model.etudiant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération du profil'
        });
    }
});

/**
 * GET /api/users/:id/recharges
 * Récupérer l'historique des recharges d'un utilisateur
 */
router.get('/:id/recharges', authenticateToken, requireSelfOrAdmin('id'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const recharges = await userController.model.getRechargesByEtudiantId(parseInt(id));
        
        res.status(200).json({
            success: true,
            message: 'Historique des recharges récupéré avec succès',
            data: recharges,
            count: recharges.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des recharges'
        });
    }
});

/**
 * GET /api/users/:id/commandes/tfe
 * Récupérer les commandes TFE d'un utilisateur
 */
router.get('/:id/commandes/tfe', authenticateToken, requireSelfOrAdmin('id'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const commandes = await userController.model.getCommandesTFEByEtudiantId(parseInt(id));
        
        res.status(200).json({
            success: true,
            message: 'Commandes TFE récupérées avec succès',
            data: commandes,
            count: commandes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des commandes TFE'
        });
    }
});

/**
 * GET /api/users/:id/commandes/stage
 * Récupérer les commandes Stage d'un utilisateur
 */
router.get('/:id/commandes/stage', authenticateToken, requireSelfOrAdmin('id'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const commandes = await userController.model.getCommandesStageByEtudiantId(parseInt(id));
        
        res.status(200).json({
            success: true,
            message: 'Commandes Stage récupérées avec succès',
            data: commandes,
            count: commandes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des commandes Stage'
        });
    }
});

/**
 * GET /api/users/:id/activites
 * Récupérer les activités d'un utilisateur
 */
router.get('/:id/activites', authenticateToken, requireSelfOrAdmin('id'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const activites = await userController.model.getActivitesByEtudiantId(parseInt(id));
        
        res.status(200).json({
            success: true,
            message: 'Activités récupérées avec succès',
            data: activites,
            count: activites.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des activités'
        });
    }
});

module.exports = router;
