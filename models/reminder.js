module.exports = (sequelize, DataTypes) => {
  const reminder = sequelize.define('reminder', {
    name: {
      type: DataTypes.INTEGER,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    data: {
      type: DataTypes.DATE,
    }
  });

  reminder.associate = (models) => {
    reminder.belongsTo(models.user, {
      foreignKey: 'todoId',
      onDelete: 'CASCADE',
    });
  };

  return reminder;
};