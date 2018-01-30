module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  user.associate = (models) => {
    user.hasMany(models.reminder, {
      foreignKey: 'todoId',
      as: 'reminders',
    });
  };

  return user;
};