const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class User extends Model {
        static associate(_models) {}
    }

    User.init(
        {
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastName: DataTypes.STRING,
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            allowLogin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dateOfBirth: DataTypes.DATEONLY,
            gender: DataTypes.STRING,
            maritalStatus: DataTypes.STRING,
            bloodGroup: DataTypes.STRING,
            mobileNumber: DataTypes.STRING,
            alternateContactNumber: DataTypes.STRING,
            familyContactNumber: DataTypes.STRING,
            socialMedia1: DataTypes.STRING,
            guardianName: DataTypes.STRING,
            permanentAddress: DataTypes.TEXT,
            currentAddress: DataTypes.TEXT,
            accountHolderName: DataTypes.STRING,
            accountNumber: DataTypes.STRING,
            bankName: DataTypes.STRING,
            bankIdentifierCode: DataTypes.STRING,
            branch: DataTypes.STRING,
            taxPayerId: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
        }
    );

    return User;
};
