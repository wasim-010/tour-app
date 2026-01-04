require('dotenv').config();
const path = require('path');

module.exports = {
    port: process.env.PORT || 3001,
    dbPath: process.env.DB_PATH || path.join(__dirname, 'tour_manager.db'),
    jwtSecret: process.env.JWT_SECRET || 'a_very_long_and_super_secret_key_that_is_hard_to_guess',
    corsOptions: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ["http://localhost:5173", "http://localhost:4173"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type,Authorization",
        credentials: true,
    }
};
