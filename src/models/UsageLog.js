'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsageLog extends Model {
    static associate(models) {
      UsageLog.belongsTo(models.User, {
        as: 'child',
        foreignKey: 'child_id',
      });
    }
  }

  UsageLog.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      child_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      active_seconds: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      session_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'UsageLog',
      tableName: 'usage_logs',
      timestamps: true,
      underscored: true,
    }
  );

  return UsageLog;
};
