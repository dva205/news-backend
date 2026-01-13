// src/migrations/07-usageLogMigration.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usage_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },

      child_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      active_seconds: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      session_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
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

    // Index để query nhanh
    await queryInterface.addIndex('usage_logs', ['child_id']);
    await queryInterface.addIndex('usage_logs', ['child_id', 'session_date']);
    await queryInterface.addIndex('usage_logs', ['session_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usage_logs');
  },
};
