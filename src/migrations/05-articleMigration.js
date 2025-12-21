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
                type: Sequelize.ENUM('6-11', '11-16'),
                allowNull: false,
            },

            published_at: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable('articles');
    },
};
