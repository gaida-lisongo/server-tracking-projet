const jwt = require('jsonwebtoken');
require('dotenv').config();

// Variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware d'authentification JWT
 * Vérifie le token Bearer dans les headers
 */
const authenticateToken = (req, res, next) => {
    try {
        // Récupérer le token depuis l'header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification requis',
                error: 'MISSING_TOKEN'
            });
        }

        // Vérifier et décoder le token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Token invalide ou expiré',
                    error: 'INVALID_TOKEN'
                });
            }

            // Ajouter les infos utilisateur à la requête
            req.user = decoded;
            next();
        });

    } catch (error) {
        console.error('Error in authenticateToken:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification du token',
            error: 'SERVER_ERROR'
        });
    }
};

/**
 * Middleware optionnel - vérifie le token s'il existe
 * Utile pour des routes semi-protégées
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // Pas de token, mais on continue sans erreur
            req.user = null;
            return next();
        }

        // Si token présent, on le vérifie
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token invalide, mais on continue sans erreur
                req.user = null;
            } else {
                req.user = decoded;
            }
            next();
        });

    } catch (error) {
        // En cas d'erreur, on continue sans authentification
        req.user = null;
        next();
    }
};

/**
 * Middleware pour vérifier des rôles spécifiques
 * @param {Array} allowedRoles - Rôles autorisés
 */
const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise',
                error: 'NOT_AUTHENTICATED'
            });
        }

        // Si pas de rôles définis, on autorise tous les utilisateurs authentifiés
        if (allowedRoles.length === 0) {
            return next();
        }

        // Vérifier si l'utilisateur a l'un des rôles autorisés
        const userRole = req.user.role || 'etudiant'; // Rôle par défaut
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Privilèges insuffisants',
                error: 'INSUFFICIENT_PRIVILEGES',
                required_roles: allowedRoles,
                user_role: userRole
            });
        }

        next();
    };
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 * @param {string} paramName - Nom du paramètre contenant l'ID utilisateur
 */
const requireSelfOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise',
                error: 'NOT_AUTHENTICATED'
            });
        }

        const requestedUserId = parseInt(req.params[paramName]);
        const currentUserId = req.user.id;
        const userRole = req.user.role || 'etudiant';

        // Admin peut accéder à tout
        if (userRole === 'admin' || userRole === 'agent') {
            return next();
        }

        // Utilisateur peut accéder seulement à ses données
        if (currentUserId === requestedUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Accès refusé - Vous ne pouvez accéder qu\'à vos propres données',
            error: 'ACCESS_DENIED'
        });
    };
};

/**
 * Middleware de logging des accès authentifiés
 */
const logAuthenticatedAccess = (req, res, next) => {
    if (req.user) {
        console.log(`🔐 [${new Date().toISOString()}] Accès authentifié:`, {
            user_id: req.user.id,
            matricule: req.user.matricule,
            route: req.originalUrl,
            method: req.method,
            ip: req.ip
        });
    }
    next();
};

/**
 * Utilitaire pour extraire et vérifier un token manuellement
 * @param {string} token - Token JWT
 * @returns {Object} Données décodées du token ou null
 */
const verifyTokenManual = (token) => {
    try {
        if (!token) return null;
        
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Error verifying token manually:', error.message);
        return null;
    }
};

/**
 * Utilitaire pour vérifier si un token est encore valide
 * @param {string} token - Token JWT
 * @returns {boolean} True si le token est valide
 */
const isTokenValid = (token) => {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole,
    requireSelfOrAdmin,
    logAuthenticatedAccess,
    verifyTokenManual,
    isTokenValid
};
