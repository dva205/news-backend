'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.User, {
        as: 'children',            
        foreignKey: 'parent_id',
      });

      User.belongsTo(models.User, {
        as: 'parent',              
        foreignKey: 'parent_id',
      });

      // Nếu bạn có RefreshToken model
      // User.hasMany(models.RefreshToken, {
      //   foreignKey: 'user_id',
      //   as: 'refreshTokens',
      // });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      password_hashed: {
        type: DataTypes.STRING(255),
        allowNull: false, 
      },
      first_name: DataTypes.STRING(50),
      last_name: DataTypes.STRING(50),
      display_name: DataTypes.STRING(100),
      role: {
        type: DataTypes.ENUM('PARENT', 'CHILD', 'ADMIN'),
        allowNull: false,
        defaultValue: 'CHILD',
      },
      dob: DataTypes.DATE,
      gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
        allowNull: true,
      },
      avatar_url: DataTypes.STRING(255),
      parent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true, 
        references: {
          model: 'users', 
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'user',
      timestamps: true, 
      underscored: true, 
    }
  );

  return User;
};
