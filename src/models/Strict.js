'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Strict extends Model {
        static associate(models) {
            Strict.belongsTo(models.User, {
                as: 'child',
                foreignKey: 'child_id',
            });
        }
    }

    Strict.init(
        {
            child_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                unique: true,
                primaryKey: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },

            time_limit_minutes: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            blocked_category: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: []
            },

            blocked_keyword: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
            },

            blocked_feature: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
            }

        },
        {
            sequelize,
            modelName: 'Strict',
            tableName: 'stricts',
            timestamps: true,
            underscored: true,
        }
    );

    return Strict;
};
