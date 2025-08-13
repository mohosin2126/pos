require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME_TEST || process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME_PROD || process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
    },
};
