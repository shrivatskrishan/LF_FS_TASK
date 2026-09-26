const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    likes_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, { tableName: 'comments', timestamps: true, underscored: true });

module.exports = Comment;
