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
          type: Sequelize.INTEGER
        },
        content: {
          type: Sequelize.STRING,
        //  allowNull: false,
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
        
        /*todoId: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          references: {
            model: 'user',
            key: 'id',
            as: 'todoId',
          },
        },*/
      }),
    down: (queryInterface ) =>
      queryInterface.dropTable('reminders'),
  };