const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv');
const {sequelize} = require('./database/models');
const registerRoutes = require('./routes');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


app.use(cors());

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
