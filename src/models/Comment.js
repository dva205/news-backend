'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {
            Comment.belongsTo(models.User, {
                foreignKey: 'child_id',
                as: 'user'
            });

            Comment.belongsTo(models.Article, {
                foreignKey: 'article_id',
                as: 'article'
            });
        }
    }

    Comment.init(
        {
            child_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            article_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'Comment',
            tableName: 'comments',
            timestamps: true,
            underscored: true,
        }
    );
    return Comment;
};
