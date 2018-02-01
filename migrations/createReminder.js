module.exports = {
    up: (queryInterface, Sequelize) =>
      queryInterface.createTable('reminders', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
        },
        content: {
          type: Sequelize.STRING,
        },
        complete: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        data: {
          type: Sequelize.DATE
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        }
      }),
    down: (queryInterface ) =>
      queryInterface.dropTable('reminders'),
};
