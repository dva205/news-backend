'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SavedArticle extends Model {
    static associate(models) {
      SavedArticle.belongsTo(models.User, {
        foreignKey: 'child_id',
        as: 'user',
      });

      SavedArticle.belongsTo(models.Article, {
        foreignKey: 'article_id',
        as: 'article',
      });
    }
  }

  SavedArticle.init(
    {
      child_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      article_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'SavedArticle',
      tableName: 'saved_articles',
      timestamps: true,
      underscored: true,
    }
  );
  return SavedArticle;
};
