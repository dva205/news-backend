'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },

      password_hashed: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      first_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      last_name: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      display_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      role: {
        type: Sequelize.ENUM('PARENT', 'CHILD', 'ADMIN'),
        allowNull: false,
        defaultValue: 'CHILD',
      },

      parent_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      dob: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      gender: {
        type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'),
        allowNull: true,
      },

      avatar_url: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  },
};
