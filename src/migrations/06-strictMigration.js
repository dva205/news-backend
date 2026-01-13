'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stricts', {
      child_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        unique: true,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      time_limit_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      blocked_keyword: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },

      blocked_category: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },

      blocked_feature: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
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
    await queryInterface.dropTable('stricts');
  },
};
