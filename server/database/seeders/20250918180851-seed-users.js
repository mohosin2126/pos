'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const PASSWORD = '12345678';
        const hash = bcrypt.hashSync(PASSWORD, 10);

        await queryInterface.bulkInsert('users', [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                isActive: true,
                allowLogin: true,
                username: 'admin',
                password: hash,
                role: 'admin',

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
                role: 'manager',

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
                password: hash,               // 12345678 (hashed)
                role: 'employee',

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
        ], {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', {
            email: ['admin@example.com', 'jane.manager@example.com', 'john.employee@example.com']
        }, {});
    }
};
