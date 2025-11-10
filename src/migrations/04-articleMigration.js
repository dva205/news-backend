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

            category: {
                type: Sequelize.TEXT,
                allowNull: false,
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
                type: Sequelize.STRING,
                allowNull: false,
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
