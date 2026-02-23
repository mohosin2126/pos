'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},

            firstName: {type: Sequelize.STRING, allowNull: false},
            lastName: Sequelize.STRING,
            email: {type: Sequelize.STRING, allowNull: false, unique: true, validate: {isEmail: true}},
            isActive: {type: Sequelize.BOOLEAN, defaultValue: false},
            allowLogin: {type: Sequelize.BOOLEAN, defaultValue: false},
            username: {type: Sequelize.STRING, unique: true},
            password: {type: Sequelize.STRING, allowNull: false},
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {model: 'roles', key: 'id'},
                onDelete: 'RESTRICT',
                onUpdate: 'CASCADE'
            },

            dateOfBirth: Sequelize.DATEONLY,
            gender: Sequelize.STRING,
            maritalStatus: Sequelize.STRING,
            bloodGroup: Sequelize.STRING,
            mobileNumber: Sequelize.STRING,
            alternateContactNumber: Sequelize.STRING,
            familyContactNumber: Sequelize.STRING,
            socialMedia1: Sequelize.STRING,
            guardianName: Sequelize.STRING,
            permanentAddress: Sequelize.TEXT,
            currentAddress: Sequelize.TEXT,
            accountHolderName: Sequelize.STRING,
            accountNumber: Sequelize.STRING,
            bankName: Sequelize.STRING,
            bankIdentifierCode: Sequelize.STRING,
            branch: Sequelize.STRING,
            taxPayerId: Sequelize.STRING,

            createdAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW')},
            updatedAt: {type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW')}
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('users');
    }
};
