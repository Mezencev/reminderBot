module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('reminders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      facebookId: {
        type: Sequelize.STRING,
      },
      reminder: {
        type: Sequelize.STRING,
      },
      complete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      date: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: (queryInterface ) => queryInterface.dropTable('reminders'),
};
