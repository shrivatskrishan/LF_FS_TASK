const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    comment_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'likes',
    timestamps: true,
    updatedAt: false,
    underscored: true
});

module.exports = Like;
