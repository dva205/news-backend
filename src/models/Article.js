'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Article extends Model {
        static associate(models) {

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

            category: {
                type: DataTypes.TEXT,
                allowNull: false,
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
                type: DataTypes.STRING,
                allowNull: false,
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
