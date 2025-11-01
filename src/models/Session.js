'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id',
      });
    }
  }

  Session.init(
    {
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'user', 
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      refresh_token_hash: {  
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
        sequelize,
        modelName: 'Session',
        tableName: 'session',     
        timestamps: true,         
        underscored: true,        
    }
  );

  return Session;
};
