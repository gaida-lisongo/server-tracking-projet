const express = require('express');
const { TuteurController } = require('../controllers');
const { authenticateToken, requireRole } = require('../utils/auth');

const router = express.Router();

// Instancier le contrôleur
const tuteurController = new TuteurController();
/**
 * POST /api/tuteur/payment
 * Créer un nouveau paiement pour un sujet
 */
router.post('/payment', authenticateToken, requireRole(['tuteur', 'admin']), async (req, res) => {
    try {
        const result = await tuteurController.createPayment(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création du paiement'
        });
    }
});

/**
 * PATCH /api/tuteur/resipiendaire/:id
 * Mettre à jour les informations d'un récipiendaire
 */
router.patch('/resipiendaire/:id', authenticateToken, requireRole(['tuteur', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { field, value } = req.body;
        
        const result = await tuteurController.updateResipiendaire(parseInt(id), field, value);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la mise à jour du récipiendaire'
        });
    }
});

/**
 * POST /api/tuteur/step-project
 * Créer une nouvelle étape de projet
 */
router.post('/step-project', authenticateToken, requireRole(['tuteur', 'admin']), async (req, res) => {
    try {
        const result = await tuteurController.createStepProject(req.body);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la création de l\'étape'
        });
    }
});

module.exports = router;