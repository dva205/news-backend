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

      User.hasOne(models.Strict, {
        as: 'stricts',
        foreignKey: 'child_id',
      });

      User.hasMany(models.Session, {
        as: 'sessions',
        foreignKey: 'user_id',
      });

      User.hasMany(models.Invite, {
        as: 'sentInvites',
        foreignKey: 'parent_id',
      });


      User.hasMany(models.Invite, {
        as: 'receivedInvites',
        foreignKey: 'child_id',
      });

      User.hasMany(models.Comment, {
        as: 'comments',
        foreignKey: 'child_id',
      });

      User.hasMany(models.SavedArticle, {
        as: 'savedArticles',
        foreignKey: 'child_id',
      });

      User.hasOne(models.Strict, {
        as: 'streaks',
        foreignKey: 'child_id',
      });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },

      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },

      password_hashed: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      first_name: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      display_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      role: {
        type: DataTypes.ENUM('PARENT', 'CHILD', 'ADMIN'),
        allowNull: false,
        defaultValue: 'CHILD',
      },

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

      dob: {
        type: DataTypes.DATEONLY
      },

      gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
        allowNull: true,
      },

      avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true
      },

    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
    }
  );

  return User;
};
