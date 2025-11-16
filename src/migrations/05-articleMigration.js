'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('articles', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            title: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            category_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },

            source_url: {
                type: Sequelize.TEXT,
                allowNull: false,
                unique: true
            },

            image_url: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            age_bucket: {
                type: Sequelize.ENUM('6-10', '11-15', '16-18', 'ALL'),
                allowNull: false,
                defaultValue: 'ALL'
            },

            published_at: {
                type: Sequelize.DATE,
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('articles');
    },
};
