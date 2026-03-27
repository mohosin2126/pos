require('dotenv').config();

const sharedConfig = {
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
};

function splitConfig(databaseName) {
    return {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD || '',
        database: process.env[databaseName],
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        ...sharedConfig,
    };
}

function urlConfig(variableName) {
    return {
        use_env_variable: variableName,
        ...sharedConfig,
    };
}

module.exports = {
    development: process.env.MYSQL_URL
        ? urlConfig('MYSQL_URL')
        : splitConfig('DB_NAME'),
    test: process.env.MYSQL_URL_TEST
        ? urlConfig('MYSQL_URL_TEST')
        : process.env.MYSQL_URL
            ? urlConfig('MYSQL_URL')
            : splitConfig('DB_NAME_TEST'),
    production: process.env.MYSQL_URL
        ? urlConfig('MYSQL_URL')
        : splitConfig('DB_NAME_PROD'),
};
