'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserArticle extends Model {
        static associate(models) {
            UserArticle.belongsTo(models.User, { foreignKey: 'user_id' });
            UserArticle.belongsTo(models.Article, { foreignKey: 'article_id' });
        }
    }

    UserArticle.init(
        {
            user_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },

            article_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'articles',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },

            is_bookmarked: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            is_blocked: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            is_read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            is_commented: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: 'UserArticle',
            tableName: 'user_articles',
            timestamps: true,
            underscored: true,
        }
    );

    return UserArticle;
};