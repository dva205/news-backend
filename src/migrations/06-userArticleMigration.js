'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_articles', {
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },

            article_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'articles',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },

            is_bookmarked: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            is_blocked: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },

            is_commented: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        await queryInterface.dropTable('user_articles');
    },
};
