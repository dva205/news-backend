'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Invite extends Model {
        static associate(models) {
            Invite.belongsTo(models.User, {
                as: 'parent',
                foreignKey: 'parent_id',
            });

            Invite.belongsTo(models.User, {
                as: 'child',
                foreignKey: 'child_id',
            });
        }
    }

    Invite.init(
        {
            code: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            parent_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            child_id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            used: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'Invite',
            tableName: 'invites',
            timestamps: true,
            underscored: true,
        }
    );

    return Invite;
};
