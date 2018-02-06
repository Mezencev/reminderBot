module.exports = (sequelize, DataTypes) => {
  const reminder = sequelize.define('reminder', {
    facebookId: {
      type: DataTypes.STRING,
    },
    reminder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
    },
  });
  return reminder;
};

