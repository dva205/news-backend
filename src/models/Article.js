'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Article extends Model {
        static associate(models) {
            Article.belongsTo(models.Category, {
                foreignKey: 'category_id',
                as: 'category'
            });

            Article.belongsToMany(models.User, {
                through: models.UserArticle,
                foreignKey: 'article_id',
                as: 'users'
            });
        }
    }

    Article.init(
        {
            title: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            category_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },

            source_url: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true
            },

            image_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            age_bucket: {
                type: DataTypes.ENUM('6-10', '11-15', '16-18', 'ALL'),
                allowNull: false,
                defaultValue: 'ALL'
            },

            published_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Article',
            tableName: 'articles',
            timestamps: true,
            underscored: true,
        }
    );

    return Article;
};
