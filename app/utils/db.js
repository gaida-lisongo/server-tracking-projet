/**
 * Configuration de la base de données MySQL
 * Pool de connexions avec gestion d'erreurs et fonctions utilitaires
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration du pool de connexions
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tfe_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00'
};

// Création du pool de connexions
const pool = mysql.createPool(poolConfig);

// Test de la connexion au démarrage
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion MySQL établie avec succès');
        console.log(`📊 Base de données: ${poolConfig.database}`);
        console.log(`🔗 Host: ${poolConfig.host}:${poolConfig.port}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion MySQL:', error.message);
        return false;
    }
};

/**
 * Exécute une requête SQL avec paramètres
 * @param {string} sql - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Résultat de la requête
 */
const query = async (sql, params = []) => {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return { success: true, data: rows, fields };
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution de la requête:', error.message);
        console.error('📝 SQL:', sql);
        console.error('📋 Params:', params);
        return { success: false, error: error.message };
    }
};

/**
 * Exécute une requête de sélection
 * @param {string} sql - Requête SELECT
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Résultat de la sélection
 */
const select = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return { success: true, data: rows };
    } catch (error) {
        console.error('❌ Erreur SELECT:', error.message);
        return { success: false, error: error.message, data: [] };
    }
};

/**
 * Exécute une requête d'insertion
 * @param {string} sql - Requête INSERT
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Résultat de l'insertion
 */
const insert = async (sql, params = []) => {
    try {
        const [result] = await pool.execute(sql, params);
        return { 
            success: true, 
            insertId: result.insertId, 
            affectedRows: result.affectedRows 
        };
    } catch (error) {
        console.error('❌ Erreur INSERT:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Exécute une requête de mise à jour
 * @param {string} sql - Requête UPDATE
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Résultat de la mise à jour
 */
const update = async (sql, params = []) => {
    try {
        const [result] = await pool.execute(sql, params);
        return { 
            success: true, 
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        };
    } catch (error) {
        console.error('❌ Erreur UPDATE:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Exécute une requête de suppression
 * @param {string} sql - Requête DELETE
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise} Résultat de la suppression
 */
const deleteQuery = async (sql, params = []) => {
    try {
        const [result] = await pool.execute(sql, params);
        return { 
            success: true, 
            affectedRows: result.affectedRows 
        };
    } catch (error) {
        console.error('❌ Erreur DELETE:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Exécute une transaction
 * @param {Function} callback - Fonction contenant les requêtes de la transaction
 * @returns {Promise} Résultat de la transaction
 */
const transaction = async (callback) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Exécuter les requêtes dans la transaction
        const result = await callback(connection);
        
        await connection.commit();
        console.log('✅ Transaction validée avec succès');
        
        return { success: true, data: result };
    } catch (error) {
        await connection.rollback();
        console.error('❌ Transaction annulée:', error.message);
        
        return { success: false, error: error.message };
    } finally {
        connection.release();
    }
};

/**
 * Obtient les statistiques du pool de connexions
 * @returns {Object} Statistiques du pool
 */
const getPoolStats = () => {
    return {
        totalConnections: pool._allConnections.length,
        freeConnections: pool._freeConnections.length,
        acquiredConnections: pool._acquiredConnections.length,
        queuedRequests: pool._connectionQueue.length
    };
};

/**
 * Ferme le pool de connexions proprement
 * @returns {Promise} Promesse de fermeture
 */
const closePool = async () => {
    try {
        await pool.end();
        console.log('✅ Pool de connexions fermé proprement');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la fermeture du pool:', error.message);
        return false;
    }
};

/**
 * Fonction helper pour construire des requêtes WHERE dynamiques
 * @param {Object} conditions - Objet avec les conditions
 * @returns {Object} SQL WHERE et paramètres
 */
const buildWhereClause = (conditions) => {
    const keys = Object.keys(conditions);
    if (keys.length === 0) {
        return { whereClause: '', params: [] };
    }
    
    const whereClause = 'WHERE ' + keys.map(key => `${key} = ?`).join(' AND ');
    const params = Object.values(conditions);
    
    return { whereClause, params };
};

/**
 * Fonction helper pour construire des requêtes SELECT avec pagination
 * @param {string} table - Nom de la table
 * @param {Object} options - Options (conditions, limit, offset, orderBy)
 * @returns {Promise} Résultat paginé
 */
const selectWithPagination = async (table, options = {}) => {
    const { conditions = {}, limit = 10, offset = 0, orderBy = 'id DESC' } = options;
    
    const { whereClause, params } = buildWhereClause(conditions);
    
    const sql = `
        SELECT * FROM ${table} 
        ${whereClause} 
        ORDER BY ${orderBy} 
        LIMIT ? OFFSET ?
    `;
    
    const countSql = `SELECT COUNT(*) as total FROM ${table} ${whereClause}`;
    
    try {
        const [dataResult] = await Promise.all([
            select(sql, [...params, limit, offset]),
            select(countSql, params)
        ]);
        
        const total = dataResult.success ? dataResult.data.length : 0;
        const totalCount = await select(countSql, params);
        
        return {
            success: true,
            data: dataResult.data,
            pagination: {
                total: totalCount.success ? totalCount.data[0].total : 0,
                limit,
                offset,
                hasNext: offset + limit < (totalCount.success ? totalCount.data[0].total : 0)
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Gestion des événements du pool
pool.on('connection', (connection) => {
    console.log('🔗 Nouvelle connexion établie:', connection.threadId);
});

pool.on('error', (err) => {
    console.error('❌ Erreur du pool MySQL:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 Reconnexion automatique...');
    }
});

// Export des fonctions
module.exports = {
    pool,
    testConnection,
    query,
    select,
    insert,
    update,
    delete: deleteQuery,
    transaction,
    getPoolStats,
    closePool,
    buildWhereClause,
    selectWithPagination
};

// Test de connexion au démarrage
testConnection();