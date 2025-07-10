const express = require('express');
const { DirecteurController } = require('../controllers');
const { authenticateToken, requireRole } = require('../utils/auth');

const router = express.Router();

// Instancier le contrôleur
const directeurController = new DirecteurController();

/**
 * POST /api/directeur/sujet
 * Créer un nouveau sujet TFE
 */
router.post('/sujet', authenticateToken, requireRole(['directeur', 'admin']), async (req, res) => {
    try {
        const result = await directeurController.createSujet(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du sujet'
        });
    }
});

/**
 * POST /api/directeur/resipiendaire
 * Créer un nouveau récipiendaire
 */
router.post('/resipiendaire', authenticateToken, requireRole(['directeur', 'admin']), async (req, res) => {
    try {
        const result = await directeurController.createResipiendaire(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du récipiendaire'
        });
    }
});

/**
 * POST /api/directeur/tuteur
 * Associer un tuteur à un sujet
 */
router.post('/tuteur', authenticateToken, requireRole(['directeur', 'admin']), async (req, res) => {
    try {
        const result = await directeurController.createTuteur(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'association du tuteur'
        });
    }
});


/**
 * POST /api/directeur/stage
 * Créer un nouveau stage
 */
router.post('/stage', authenticateToken, requireRole(['directeur', 'admin']), async (req, res) => {
    try {
        const result = await directeurController.createStage(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du stage'
        });
    }
});

module.exports = router;