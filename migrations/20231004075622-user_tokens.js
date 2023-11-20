'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("users_tokens", {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
      },
      discord_user_id: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false,
      },
      access_token: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      refresh_token: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      expires_in: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
