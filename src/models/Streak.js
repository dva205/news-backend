'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Streak extends Model {
    static associate(models) {
      Streak.belongsTo(models.User, {
        as: 'child',
        foreignKey: 'child_id',
      });
    }
  }

  Streak.init(
    {
      child_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        unique: true,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      streak_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      max_streak: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_activity_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Streak',
      tableName: 'streaks',
      timestamps: true,
      underscored: true,
    }
  );

  return Streak;
};
