const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    profile_picture_url: {
        type: DataTypes.STRING(255)
    },
    bio: {
        type: DataTypes.TEXT
    }
}, { tableName: 'users', timestamps: true, underscored: true });

module.exports = User;
