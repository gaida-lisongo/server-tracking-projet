const express = require('express');
const { PromotionController } = require('../controllers');

const router = express.Router();

// Instancier le contrôleur
const promotionController = new PromotionController();

/**
 * GET /api/promotions/programmes
 * Récupère l'arbre complet des programmes avec toutes leurs données
 * Structure: Programmes > Promotions > [Travaux, Notes, Stages, Sujets]
 */
router.get('/programmes', async (req, res) => {
    try {
        // Initialiser le modèle pour construire l'arbre complet
        await promotionController.model.init();
        
        // Récupérer l'arbre complet des programmes
        const programmes = promotionController.fetchPromotions();
        
        res.status(200).json({
            success: true,
            message: 'Arbre des programmes récupéré avec succès',
            data: programmes,
            count: programmes.length,
            structure: {
                description: "Arbre hiérarchique complet",
                levels: [
                    "Programme/Section (chef, mention, etc.)",
                    "Promotions (classe, système, etc.)", 
                    "Ressources (travaux, notes, stages, sujets)"
                ]
            }
        });
        
    } catch (error) {
        console.error('Error fetching programmes tree:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'arbre des programmes',
            error: error.message
        });
    }
});

module.exports = router;
