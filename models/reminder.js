module.exports = (sequelize, DataTypes) => {
  const reminder = sequelize.define('reminder', {
    name: {
      type: DataTypes.STRING,
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
  return reminder;
};