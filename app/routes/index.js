const express = require('express');
const userRoutes = require('./userRoutes');
const promotionRoutes = require('./promotionRoutes');

const router = express.Router();

/**
 * Configuration centralisée des routes de l'API
 * Structure: /api/{module}/{endpoint}
 */

// Routes utilisateurs - /api/users/*
router.use('/users', userRoutes);

// Routes promotions/programmes - /api/promotions/*
router.use('/promotions', promotionRoutes);

// Route de test de l'API
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API TFE App - Routes fonctionnelles',
        timestamp: new Date().toISOString(),
        routes: {
            users: '/api/users',
            promotions: '/api/promotions'
        }
    });
});

// Route 404 pour les endpoints API non trouvés
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint API non trouvé',
        requested: req.originalUrl,
        available_routes: [
            'GET /api/health',
            'POST /api/users/login',
            'GET /api/users/:id/profile',
            'POST /api/users/commande/*',
            'GET /api/promotions/programmes'
        ]
    });
});

module.exports = router;
