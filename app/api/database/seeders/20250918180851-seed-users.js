'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();
        const PASSWORD = '12345678';
        const hash = bcrypt.hashSync(PASSWORD, 10);
        const { QueryTypes } = Sequelize;

     
        const [adminRole] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name = 'admin'`,
            { type: QueryTypes.SELECT }
        );
        const [managerRole] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name = 'manager'`,
            { type: QueryTypes.SELECT }
        );
        const [employeeRole] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name = 'employee'`,
            { type: QueryTypes.SELECT }
        );

        if (!adminRole || !managerRole || !employeeRole) {
            throw new Error('Roles must be seeded before users. Run role seeder first.');
        }

        const userSeeds = [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@demo.com',
                isActive: true,
                allowLogin: true,
                username: 'admin',
                password: hash,
                roleId: adminRole.id,

                dateOfBirth: '1988-03-15',
                gender: 'Other',
                maritalStatus: 'Single',
                bloodGroup: 'O+',
                mobileNumber: '+8801711111111',
                alternateContactNumber: null,
                familyContactNumber: null,
                socialMedia1: 'https://twitter.com/admin',
                guardianName: null,
                permanentAddress: '123 Admin Street, Dhaka',
                currentAddress: '123 Admin Street, Dhaka',
                accountHolderName: 'Admin User',
                accountNumber: '000111222333',
                bankName: 'Example Bank',
                bankIdentifierCode: 'EXAMPKAA',
                branch: 'Dhaka Main',
                taxPayerId: 'TIN-123456',

                createdAt: now,
                updatedAt: now
            },
            {
                firstName: 'Jane',
                lastName: 'Manager',
                email: 'jane.manager@example.com',
                isActive: true,
                allowLogin: true,
                username: 'jane.manager',
                password: hash,
                roleId: managerRole.id,

                dateOfBirth: '1990-07-22',
                gender: 'Female',
                maritalStatus: 'Married',
                bloodGroup: 'A+',
                mobileNumber: '+8801722222222',
                alternateContactNumber: null,
                familyContactNumber: null,
                socialMedia1: 'https://linkedin.com/in/janemanager',
                guardianName: null,
                permanentAddress: '456 Manager Road, Chattogram',
                currentAddress: '456 Manager Road, Chattogram',
                accountHolderName: 'Jane Manager',
                accountNumber: '444555666777',
                bankName: 'People’s Bank',
                bankIdentifierCode: 'PEOPBDDH',
                branch: 'Chattogram',
                taxPayerId: 'TIN-654321',

                createdAt: now,
                updatedAt: now
            },
            {
                firstName: 'John',
                lastName: 'Employee',
                email: 'john.employee@example.com',
                isActive: false,
                allowLogin: false,
                username: 'john.employee',
                password: hash,               
                roleId: employeeRole.id,

                dateOfBirth: '1995-11-05',
                gender: 'Male',
                maritalStatus: 'Single',
                bloodGroup: 'B+',
                mobileNumber: '+8801733333333',
                alternateContactNumber: null,
                familyContactNumber: null,
                socialMedia1: null,
                guardianName: 'Doe Senior',
                permanentAddress: '789 Worker Ave, Sylhet',
                currentAddress: '789 Worker Ave, Sylhet',
                accountHolderName: 'John Employee',
                accountNumber: '888999000111',
                bankName: 'National Bank',
                bankIdentifierCode: 'NATIBDDH',
                branch: 'Sylhet',
                taxPayerId: 'TIN-789012',

                createdAt: now,
                updatedAt: now
            }
        ];

        const existingUsers = await queryInterface.sequelize.query(
            `SELECT email FROM users WHERE email IN (:emails)`,
            {
                replacements: { emails: userSeeds.map((user) => user.email) },
                type: QueryTypes.SELECT,
            }
        );
        const existingEmails = new Set(existingUsers.map((user) => user.email));

        const usersToInsert = userSeeds.filter((user) => !existingEmails.has(user.email));
        if (usersToInsert.length > 0) {
            await queryInterface.bulkInsert('users', usersToInsert, {});
        }
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', {
            email: ['admin@demo.com', 'jane.manager@example.com', 'john.employee@example.com']
        }, {});
    }
};
