const express = require('express');
const { sequelize } = require('./database/models');
const registerRoutes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

registerRoutes(app);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
})();
