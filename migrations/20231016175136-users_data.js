'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("users_data", {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
      },
      steam_user_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      discord_user_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      avg_place: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      match_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      first_places: {
        type: Sequelize.INTEGER,
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
