/**
 * Serveur Express avec Socket.IO pour TFE App
 * Configuration CORS ouverte et écoute sur toutes les interfaces
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import de la base de données
const db = require('./app/utils/db');

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Création de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration Socket.IO avec CORS ouvert
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["*"],
        credentials: true
    }
});

// CORS ouvert pour toutes les requêtes
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true
}));

// Middlewares de base
app.use(express.json({ limit: '50mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parser URL-encoded

// Middleware pour ajouter les headers CORS manuellement
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Route de test principal - doit sourire 😊
app.get('/', (req, res) => {
    res.json({
        message: '😊 TFE App Server is running!',
        status: 'success',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        description: 'Serveur backend pour l\'application TFE - ISTA GM',
        author: 'ELmes',
        endpoints: {
            health: '/health',
            socket: '/socket.io',
            api: '/api (à venir)'
        }
    });
});

// Route de santé du serveur
app.get('/health', async (req, res) => {
    try {
        // Test de la base de données
        const dbTest = await db.testConnection();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: dbTest ? 'connected' : 'disconnected',
                socket: 'active',
                server: 'running'
            },
            stats: db.getPoolStats()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Gestion des événements Socket.IO
io.on('connection', (socket) => {
    console.log(`🔌 Nouvelle connexion Socket.IO: ${socket.id}`);
    
    // Message de bienvenue
    socket.emit('welcome', {
        message: '😊 Bienvenue sur TFE App!',
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });
    
    // Événement de test
    socket.on('test', (data) => {
        console.log('📨 Message test reçu:', data);
        socket.emit('test_response', {
            message: '😊 Test réussi!',
            received: data,
            timestamp: new Date().toISOString()
        });
    });
    
    // Événement pour rejoindre une room (pour les TFE)
    socket.on('join_project', (projectId) => {
        socket.join(`project_${projectId}`);
        console.log(`👥 Socket ${socket.id} a rejoint le projet ${projectId}`);
        
        socket.emit('joined_project', {
            projectId: projectId,
            message: `Vous avez rejoint le projet ${projectId} 😊`
        });
    });
    
    // Événement pour quitter une room
    socket.on('leave_project', (projectId) => {
        socket.leave(`project_${projectId}`);
        console.log(`👋 Socket ${socket.id} a quitté le projet ${projectId}`);
    });
    
    // Chat en temps réel pour les projets
    socket.on('project_message', (data) => {
        const { projectId, message, user } = data;
        
        // Diffuser le message à tous les participants du projet
        socket.to(`project_${projectId}`).emit('new_project_message', {
            message: message,
            user: user,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
        
        console.log(`💬 Message projet ${projectId}: ${user} - ${message}`);
    });
    
    // Notification en temps réel
    socket.on('send_notification', (data) => {
        const { targetUserId, title, message, type } = data;
        
        // Envoyer la notification à l'utilisateur cible
        io.emit('notification', {
            title: title,
            message: message,
            type: type || 'info',
            timestamp: new Date().toISOString()
        });
        
        console.log(`🔔 Notification envoyée: ${title}`);
    });
    
    // Collaboration en temps réel (pour l'édition de documents)
    socket.on('document_change', (data) => {
        const { documentId, changes, user } = data;
        
        socket.to(`doc_${documentId}`).emit('document_updated', {
            changes: changes,
            user: user,
            timestamp: new Date().toISOString()
        });
        
        console.log(`📝 Document ${documentId} modifié par ${user}`);
    });
    
    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`🔌 Déconnexion Socket.IO: ${socket.id}`);
    });
    
    // Gestion des erreurs Socket.IO
    socket.on('error', (error) => {
        console.error(`❌ Erreur Socket.IO ${socket.id}:`, error);
    });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err.stack);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// Route 404 pour les endpoints non trouvés
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint non trouvé',
        message: `L'endpoint ${req.originalUrl} n'existe pas 😢`,
        suggestion: 'Vérifiez l\'URL ou consultez la documentation'
    });
});

// Démarrage du serveur sur toutes les interfaces (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 ====================================');
    console.log('🚀 TFE APP SERVER DÉMARRÉ AVEC SUCCÈS');
    console.log('🚀 ====================================');
    console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO: Actif`);
    console.log(`📊 Base de données: Connexion en cours...`);
    console.log(`😊 Status: Le serveur sourit!`);
    console.log('🚀 ====================================');
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', async () => {
    console.log('🛑 Arrêt du serveur en cours...');
    
    // Fermer les connexions Socket.IO
    io.close();
    
    // Fermer le pool de base de données
    await db.closePool();
    
    // Fermer le serveur HTTP
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du serveur (Ctrl+C)...');
    
    io.close();
    await db.closePool();
    
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
});

// Export pour les tests
module.exports = { app, server, io };