const { sequelize } = require('../database/models');

const userManagement=require('./user-management/index')
const roleManagement=require('./role/index')

module.exports = function registerRoutes(app) {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('/health', async (req, res) => {
        try {
            await sequelize.authenticate();
            res.status(200).json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
        } catch (e) {
            res.status(500).json({ status: 'error', error: e.message });
        }
    });


    app.use('/api/v1/admin/user', userManagement);
    app.use('/api/v1/admin/role', roleManagement);


};
